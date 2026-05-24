import { NextRequest, NextResponse } from 'next/server'
import { savePushSubscription } from '@/lib/kv/push'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { talkId, questionId, subscription } = data
    const targetId = talkId || questionId

    if (!targetId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Missing talkId/questionId or subscription' }, { status: 400 })
    }

    console.log(`[Push] Subscribing to topic ${targetId}`);
    await savePushSubscription(targetId, subscription)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to save push subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
