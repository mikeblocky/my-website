import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRedisClient, lastPetGiftKey, totalPetGiftsKey } from '$lib/kv/client';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
  try {
    const redis = await getRedisClient();
    const lastGif = await redis.get(lastPetGiftKey);
    const total = await redis.get(totalPetGiftsKey);
    return json({ gif: lastGif, total: parseInt(total || '0', 10) });
  } catch (err) {
    return json({ gif: null, total: 0 });
  }
};

export const POST: RequestHandler = async () => {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const isCat = Math.random() > 0.5;
    const apiUrl = isCat 
      ? 'https://api.thecatapi.com/v1/images/search?mime_types=gif' 
      : 'https://api.thedogapi.com/v1/images/search?mime_types=gif';
    
    const res = await fetch(apiUrl);
    const data = await res.json();
    const gifUrl = data[0]?.url;

    if (!gifUrl) {
      throw new Error('Failed to fetch GIF from source');
    }

    const redis = await getRedisClient();
    await redis.set(lastPetGiftKey, gifUrl);
    const newTotal = await redis.incr(totalPetGiftsKey);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pet Messenger 🐾',
        content: `A small gift has been sent: ${gifUrl}`
      })
    });

    if (!response.ok) {
      return json({ error: 'Failed to send to Discord' }, { status: 500 });
    }

    return json({ success: true, gif: gifUrl, total: newTotal });
  } catch (err) {
    console.error('Error in annoy route:', err);
    return json({ error: 'Internal error' }, { status: 500 });
  }
};
