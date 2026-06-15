import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { savePushSubscription } from '$lib/kv/push';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { talkId, questionId, subscription } = data;
    const targetId = talkId || questionId;

    if (!targetId || !subscription?.endpoint) {
      return json({ error: 'Missing talkId/questionId or subscription' }, { status: 400 });
    }

    console.log(`[Push] Subscribing to topic ${targetId}`);
    await savePushSubscription(targetId, subscription);

    return json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
