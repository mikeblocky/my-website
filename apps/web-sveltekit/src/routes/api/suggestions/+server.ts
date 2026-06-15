import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  buildSuggestionPayload,
  saveSuggestion,
  updateSuggestionStatus,
  replyToSuggestion,
  followUpSuggestion,
  updateSuggestionThreadMessage
} from '$lib/kv/suggestions';
import { getMediaSuggestions } from '$lib/kv/suggestions-cache';
import { env } from '$env/dynamic/private';
import { getMessageCooldown, reserveMessageCooldown } from '$lib/kv/cooldown';
import { validateImageUrls } from '$lib/images/attachment-limits';
import { notifyOwnerNewSuggestion } from '$lib/notify/discord';
import { getAutomaticReference } from '$lib/utils/suggestion-helper';
import type { SuggestionCategory, SuggestionReference } from '@mikeblocky/site-data';

const MAX_TEXT_LENGTH = 800;
const categories: SuggestionCategory[] = ['manga', 'anime', 'film', 'series', 'book', 'game', 'music', 'other'];

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function cleanReference(value: unknown): SuggestionReference | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const reference = value as Record<string, unknown>;
  const url = cleanText(reference.url);
  if (!url) return undefined;

  return {
    url,
    title: cleanText(reference.title),
    description: cleanText(reference.description),
    image: cleanText(reference.image),
    siteName: cleanText(reference.siteName),
    type: cleanText(reference.type)
  };
}

export const GET: RequestHandler = async ({ request }) => {
  const [suggestions, cooldown] = await Promise.all([
    getMediaSuggestions(),
    getMessageCooldown('suggestion', request)
  ]);

  return json({ suggestions, cooldown });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.title !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const title = data.title.trim();
  if (title.length === 0) {
    return json({ error: 'Suggestion title cannot be empty' }, { status: 400 });
  }

  const note = cleanText(data.note);
  const bestPart = cleanText(data.bestPart);
  if ((note?.length || 0) > MAX_TEXT_LENGTH || (bestPart?.length || 0) > MAX_TEXT_LENGTH) {
    return json({ error: 'Suggestion details are too long' }, { status: 400 });
  }

  const reservation = await reserveMessageCooldown('suggestion', request);
  if (reservation.blocked) {
    return json(
      { error: 'Please wait before sending another suggestion.', cooldown: reservation.cooldown },
      { status: 429 }
    );
  }

  const category = typeof data.category === 'string' && categories.includes(data.category as SuggestionCategory)
    ? data.category as SuggestionCategory
    : 'other';
  const author = cleanText(data.author) || 'anonymous';
  const imageUrl = cleanText(data.imageUrl);
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: unknown): url is string => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(imageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }

  let reference = cleanReference(data.reference);
  if (!reference) {
    reference = getAutomaticReference(title, category);
  }

  const suggestion = buildSuggestionPayload({
    author,
    title,
    category,
    note,
    bestPart,
    reference,
    imageUrl,
    imageUrls
  });

  await saveSuggestion(suggestion);

  notifyOwnerNewSuggestion(author, title, note).catch(err => console.error(err));

  return json({ suggestion, cooldown: reservation.cooldown }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== 'string' || typeof data.reply !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id, reply, passcode, imageUrl, imageUrls } = data;

  if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
    return json({ error: 'Incorrect passcode' }, { status: 401 });
  }

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(cleanImageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }

  const updated = await replyToSuggestion(id, reply, imageUrl, cleanImageUrls);
  if (!updated) {
    return json({ error: 'Suggestion not found' }, { status: 404 });
  }

  return json({ suggestion: updated }, { status: 200 });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id, status, body, messageId, passcode, imageUrl, imageUrls } = data;

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(cleanImageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }

  // Case 1: Edit an existing comment/message (requires passcode)
  if (messageId) {
    if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
      return json({ error: 'Incorrect passcode' }, { status: 401 });
    }
    if (typeof body !== 'string' || body.trim().length === 0) {
      return json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const updated = await updateSuggestionThreadMessage(id, messageId, body, imageUrl, cleanImageUrls);
    if (!updated) {
      return json({ error: 'Message not found' }, { status: 404 });
    }

    return json({ suggestion: updated }, { status: 200 });
  }

  // Case 2: Status update (requires passcode)
  if (status) {
    if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
      return json({ error: 'Incorrect passcode' }, { status: 401 });
    }
    const validStatuses = ['planning', 'progressing', 'completed', 'dropped'];
    if (!validStatuses.includes(status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await updateSuggestionStatus(id, status as any);
    if (!updated) {
      return json({ error: 'Suggestion not found' }, { status: 404 });
    }

    return json({ suggestion: updated }, { status: 200 });
  }

  // Case 3: Visitor follow-up (no passcode needed)
  if (body) {
    const trimmedBody = body.trim();
    if (trimmedBody.length === 0) {
      return json({ error: 'Follow-up cannot be empty' }, { status: 400 });
    }

    const reservation = await reserveMessageCooldown('suggestion', request);
    if (reservation.blocked) {
      return json(
        { error: 'Please wait before sending another message.', cooldown: reservation.cooldown },
        { status: 429 }
      );
    }

    const updated = await followUpSuggestion(id, trimmedBody, imageUrl, cleanImageUrls);
    if (!updated) {
      return json({ error: 'Suggestion not found' }, { status: 404 });
    }

    return json({ suggestion: updated, cooldown: reservation.cooldown }, { status: 200 });
  }

  return json({ error: 'Invalid operation' }, { status: 400 });
};
