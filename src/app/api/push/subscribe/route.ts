import { NextRequest, NextResponse } from 'next/server'
import { savePushSubscription } from '@/lib/kv/push'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { questionId, subscription } = data

    if (!questionId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Missing questionId or subscription' }, { status: 400 })
    }

    await savePushSubscription(questionId, subscription)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to save push subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
