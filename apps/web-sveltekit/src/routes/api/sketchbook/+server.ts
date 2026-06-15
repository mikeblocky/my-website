import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import {
  buildDrawingPayload,
  saveDrawing,
  incrementDrawingLikes,
  deleteDrawing,
  replyToDrawing,
  updateThreadMessage
} from '$lib/kv/sketchbook';
import { getSketchbookDrawings } from '$lib/kv/sketchbook-cache';
import { getMessageCooldown, reserveMessageCooldown } from '$lib/kv/cooldown';

const MAX_BODY_LENGTH = 300;

export const GET: RequestHandler = async ({ request }) => {
  const [drawings, cooldown] = await Promise.all([
    getSketchbookDrawings(),
    getMessageCooldown('sketchbook', request)
  ]);

  return json({ drawings, cooldown });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.imageUrl !== 'string') {
    return json({ error: 'Invalid payload: Drawing image is required.' }, { status: 400 });
  }

  // Basic base64 image validation
  if (!data.imageUrl.startsWith('data:image/')) {
    return json({ error: 'Invalid payload: Image must be a valid data URL.' }, { status: 400 });
  }

  // Prevent enormous payload sizes (e.g. > 5MB base64 string)
  if (data.imageUrl.length > 5_000_000) {
    return json({ error: 'Drawing is too large.' }, { status: 413 });
  }

  const reservation = await reserveMessageCooldown('sketchbook', request);
  if (reservation.blocked) {
    return json(
      { error: 'Please wait before uploading another drawing.', cooldown: reservation.cooldown },
      { status: 429 }
    );
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous';
  const body = typeof data.body === 'string' ? data.body.trim() : undefined;

  if (body && body.length > MAX_BODY_LENGTH) {
    return json({ error: 'Caption is too long.' }, { status: 400 });
  }

  const drawing = buildDrawingPayload({ author, body, imageUrl: data.imageUrl });

  await saveDrawing(drawing);

  return json({ drawing, cooldown: reservation.cooldown }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data.id !== 'string') {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { id, action, reply, messageId, body, passcode, imageUrl } = data;

  // Public visitor action: Like
  if (action === 'like') {
    const updated = await incrementDrawingLikes(id);
    if (!updated) {
      return json({ error: 'Drawing not found' }, { status: 404 });
    }
    return json({ drawing: updated }, { status: 200 });
  }

  // Admin action validation
  if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (messageId) {
    if (typeof body !== 'string' || body.trim().length === 0) {
      return json({ error: 'Content cannot be empty' }, { status: 400 });
    }
    const updated = await updateThreadMessage(id, messageId, body, imageUrl);
    if (!updated) {
      return json({ error: 'Message not found' }, { status: 404 });
    }
    return json({ drawing: updated }, { status: 200 });
  } else {
    if (typeof reply !== 'string' || reply.trim().length === 0) {
      return json({ error: 'Reply cannot be empty' }, { status: 400 });
    }
    const updated = await replyToDrawing(id, reply, imageUrl);
    if (!updated) {
      return json({ error: 'Drawing not found' }, { status: 404 });
    }
    return json({ drawing: updated }, { status: 200 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id');
  const passcode = url.searchParams.get('passcode');

  if (!id) {
    return json({ error: 'Missing drawing ID' }, { status: 400 });
  }

  if (env.ADMIN_PASSCODE && passcode !== env.ADMIN_PASSCODE) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = await deleteDrawing(id);
  if (!success) {
    return json({ error: 'Drawing not found' }, { status: 404 });
  }
  
  return json({ success: true }, { status: 200 });
};
