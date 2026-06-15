import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { buildTalkPayload, saveTalk, replyToTalk, followUpTalk, updateThreadMessage } from '$lib/kv/talk';
import { getTalkMessages } from '$lib/kv/talk-cache';
import { getSubscribedTalkIds } from '$lib/kv/push';
import { getMessageCooldown, reserveMessageCooldown } from '$lib/kv/cooldown';
import { validateImageUrls } from '$lib/images/attachment-limits';
import { notifyOwnerNewTalk } from '$lib/notify/discord';
import webpush from 'web-push';
import { getSubscriptionsForTalk } from '$lib/kv/push';

const MAX_BODY_LENGTH = 800;

export const GET: RequestHandler = async ({ request }) => {
  const [talks, subscribedIds] = await Promise.all([
    getTalkMessages(),
    getSubscribedTalkIds()
  ]);
  const cooldown = await getMessageCooldown('talk', request);

  const enriched = talks.map(t => ({
    ...t,
    notifying: subscribedIds.has(t.id)
  }));

  return json({ questions: enriched, cooldown });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.body !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const body = data.body.trim();
  if (body.length === 0) {
    return json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  if (body.length > MAX_BODY_LENGTH) {
    return json({ error: 'Message is too long' }, { status: 400 });
  }

  const reservation = await reserveMessageCooldown('talk', request);
  if (reservation.blocked) {
    return json(
      { error: 'Please wait before sending another message.', cooldown: reservation.cooldown },
      { status: 429 }
    );
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous';
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : undefined;
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: any) => typeof url === 'string')
    : undefined;
  const imageError = validateImageUrls(imageUrls);
  if (imageError) {
    return json({ error: imageError }, { status: 413 });
  }
  const talk = buildTalkPayload({ author, body, imageUrl, imageUrls });

  await saveTalk(talk);

  notifyOwnerNewTalk(author, body).catch(err => console.error(err));

  return json({ question: talk, cooldown: reservation.cooldown }, { status: 201 });
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

  const updatedTalk = await replyToTalk(id, reply, imageUrl, cleanImageUrls);
  
  if (!updatedTalk) {
    return json({ error: 'Post not found' }, { status: 404 });
  }

  getSubscriptionsForTalk(id).then(async (subscriptions) => {
    if (subscriptions.length > 0) {
      webpush.setVapidDetails(
        'mailto:contact@mikeblocky.com',
        env.PUBLIC_VAPID_PUBLIC_KEY!,
        env.VAPID_PRIVATE_KEY!
      );

      const notificationPayload = JSON.stringify({
        title: 'mikeblocky responded to your post!',
        body: reply.trim().length > 120 ? reply.trim().slice(0, 120) + '...' : reply.trim(),
        url: '/talk',
        tag: `talk-${id}`
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub.subscription as any, notificationPayload);
        } catch (pushError: any) {
          console.error('Push notification failed for subscription:', pushError?.statusCode);
        }
      }
    }
  }).catch(err => console.error('Push notifier failed', err));

  return json({ question: updatedTalk }, { status: 200 });
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

    const updatedTalk = await updateThreadMessage(id, messageId, body, imageUrl, cleanImageUrls);
    
    if (!updatedTalk) {
      return json({ error: 'Message not found' }, { status: 404 });
    }
    return json({ question: updatedTalk }, { status: 200 });
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

    const reservation = await reserveMessageCooldown('talk', request);
    if (reservation.blocked) {
      return json(
        { error: 'Please wait before sending another message.', cooldown: reservation.cooldown },
        { status: 429 }
      );
    }

    const updatedTalk = await followUpTalk(id, trimmedBody, imageUrl, cleanImageUrls);

    if (!updatedTalk) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    notifyOwnerNewTalk(
      updatedTalk.author || 'anonymous',
      `[Follow-up] ${trimmedBody}`
    ).catch(err => console.error(err));

    return json({ question: updatedTalk, cooldown: reservation.cooldown }, { status: 200 });
  }
};
