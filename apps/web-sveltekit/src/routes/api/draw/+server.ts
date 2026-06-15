import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { buildPromptPayload, savePrompt, replyToPrompt, followUpPrompt, updateThreadMessage } from '$lib/kv/draw';
import { getDrawPrompts } from '$lib/kv/draw-cache';
import { getMessageCooldown, reserveMessageCooldown } from '$lib/kv/cooldown';
import { validateImageUrls } from '$lib/images/attachment-limits';
import { notifyOwnerNewPrompt } from '$lib/notify/discord';

const MAX_BODY_LENGTH = 800;

export const GET: RequestHandler = async ({ request }) => {
  const [prompts, cooldown] = await Promise.all([
    getDrawPrompts(),
    getMessageCooldown('draw', request)
  ]);

  return json({ prompts, cooldown });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.body !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const body = data.body.trim();
  if (body.length === 0) {
    return json({ error: 'Prompt cannot be empty' }, { status: 400 });
  }

  if (body.length > MAX_BODY_LENGTH) {
    return json({ error: 'Prompt is too long' }, { status: 400 });
  }

  const reservation = await reserveMessageCooldown('draw', request);
  if (reservation.blocked) {
    return json(
      { error: 'Please wait before sending another prompt.', cooldown: reservation.cooldown },
      { status: 429 }
    );
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous';
  const character = typeof data.character === 'string' ? data.character : undefined;
  const media = typeof data.media === 'string' ? data.media : undefined;
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : undefined;
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(imageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }
  const prompt = buildPromptPayload({ author, body, character, media, imageUrl, imageUrls });

  await savePrompt(prompt);

  notifyOwnerNewPrompt(author, body).catch(err => console.error(err));

  return json({ prompt, cooldown: reservation.cooldown }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== 'string' || typeof data.reply !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id, reply, passcode, imageUrl, imageUrls } = data;
  
  if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(cleanImageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }

  const updatedPrompt = await replyToPrompt(id, reply, imageUrl, cleanImageUrls);
  
  if (!updatedPrompt) {
    return json({ error: 'Prompt not found' }, { status: 404 });
  }

  return json({ prompt: updatedPrompt }, { status: 200 });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id, body, messageId, passcode, imageUrl, imageUrls } = data;

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(cleanImageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }

  if (messageId) {
    if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (typeof body !== 'string' || body.trim().length === 0) {
      return json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const updatedPrompt = await updateThreadMessage(id, messageId, body, imageUrl, cleanImageUrls);
    
    if (!updatedPrompt) {
      return json({ error: 'Message not found' }, { status: 404 });
    }
    return json({ prompt: updatedPrompt }, { status: 200 });
  } else {
    if (typeof body !== 'string') {
      return json({ error: 'Invalid payload' }, { status: 400 });
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length === 0) {
      return json({ error: 'Follow-up cannot be empty' }, { status: 400 });
    }
    if (trimmedBody.length > MAX_BODY_LENGTH) {
      return json({ error: 'Follow-up is too long' }, { status: 400 });
    }

    const reservation = await reserveMessageCooldown('draw', request);
    if (reservation.blocked) {
      return json(
        { error: 'Please wait before sending another prompt.', cooldown: reservation.cooldown },
        { status: 429 }
      );
    }

    const updatedPrompt = await followUpPrompt(id, trimmedBody, imageUrl, cleanImageUrls);

    if (!updatedPrompt) {
      return json({ error: 'Prompt not found' }, { status: 404 });
    }

    notifyOwnerNewPrompt(
      updatedPrompt.author || 'anonymous',
      `[Follow-up] ${trimmedBody}`
    ).catch(err => console.error(err));

    return json({ prompt: updatedPrompt, cooldown: reservation.cooldown }, { status: 200 });
  }
};
