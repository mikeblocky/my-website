import { NextRequest, NextResponse } from 'next/server'
import { buildQuestionPayload, fetchQuestions, saveQuestion } from '@/lib/kv/ask'
import { initialQuestions } from '@/app/ask/_data/questions'
import { notifyOwnerNewQuestion } from '@/lib/notify/discord'

const MAX_BODY_LENGTH = 800

export async function GET() {
  const stored = await fetchQuestions()
  const merged = (stored.length > 0 ? stored : initialQuestions).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return NextResponse.json({ questions: merged })
}

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.body !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const body = data.body.trim()
  if (body.length === 0) {
    return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 })
  }

  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Question is too long' }, { status: 400 })
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous'
  const question = buildQuestionPayload({ author, body })

  await saveQuestion(question)

  // Await the webhook in the request lifecycle so serverless execution
  // doesn't end before Discord receives the POST.
  await notifyOwnerNewQuestion(author, body)

  return NextResponse.json({ question }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string' || typeof data.reply !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, reply, passcode } = data
  
  if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updatedQuestion = await import('@/lib/kv/ask').then(m => m.replyToQuestion(id, reply))
  
  if (!updatedQuestion) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  // Send push notification to the person who asked
  try {
    const { getSubscriptionsForQuestion, removeSubscription } = await import('@/lib/kv/push')
    const subscriptions = await getSubscriptionsForQuestion(id)
    
    if (subscriptions.length > 0) {
      const webpush = await import('web-push')
      
      webpush.default.setVapidDetails(
        'mailto:contact@mikeblocky.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      )

      const notificationPayload = JSON.stringify({
        title: 'mikeblocky answered your question!',
        body: reply.trim().length > 120 ? reply.trim().slice(0, 120) + '...' : reply.trim(),
        url: '/ask',
        tag: `reply-${id}`
      })

      for (const sub of subscriptions) {
        try {
          await webpush.default.sendNotification(sub.subscription as any, notificationPayload)
        } catch (pushError: any) {
          console.error('Push notification failed for subscription:', pushError?.statusCode)
        }
      }

      // Clean up used subscriptions
      await removeSubscription(id)
    }
  } catch (pushError) {
    // Don't fail the reply if push notifications fail
    console.error('Push notification error (non-blocking):', pushError)
  }

  return NextResponse.json({ question: updatedQuestion }, { status: 200 })
}
