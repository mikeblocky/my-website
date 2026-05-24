import { after, NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildQuestionPayload, saveQuestion } from '@/lib/kv/ask'
import { ASK_QUESTIONS_TAG, getAskQuestions } from '@/lib/kv/ask-cache'
import { notifyOwnerNewQuestion } from '@/lib/notify/discord'
import { getSubscribedQuestionIds } from '@/lib/kv/push'

const MAX_BODY_LENGTH = 800

export async function GET() {
  const [questions, subscribedIds] = await Promise.all([
    getAskQuestions(),
    getSubscribedQuestionIds()
  ])

  const enriched = questions.map(q => ({
    ...q,
    notifying: subscribedIds.has(q.id)
  }))

  return NextResponse.json(
    { questions: enriched },
    {
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    }
  )
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
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : undefined
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: any) => typeof url === 'string')
    : undefined
  const question = buildQuestionPayload({ author, body, imageUrl, imageUrls })

  await saveQuestion(question)
  revalidateTag(ASK_QUESTIONS_TAG, 'max')

  after(async () => {
    await notifyOwnerNewQuestion(author, body)
  })

  return NextResponse.json({ question }, { status: 201 })
}

/** Admin reply — requires passcode */
export async function PUT(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string' || typeof data.reply !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, reply, passcode, imageUrl, imageUrls } = data
  
  if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined

  const updatedQuestion = await import('@/lib/kv/ask').then(m => m.replyToQuestion(id, reply, imageUrl, cleanImageUrls))
  
  if (!updatedQuestion) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }
  revalidateTag(ASK_QUESTIONS_TAG, 'max')

  after(async () => {
    try {
      const { getSubscriptionsForQuestion } = await import('@/lib/kv/push')
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

        // Don't remove subscriptions — keep them alive for threaded follow-ups
      }
    } catch (pushError) {
      console.error('Push notification error (non-blocking):', pushError)
    }
  })

  return NextResponse.json({ question: updatedQuestion }, { status: 200 })
}

/** Visitor follow-up or Admin edit */
export async function PATCH(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, body, messageId, passcode, imageUrl, imageUrls } = data

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined

  if (messageId) {
    // Edit an existing message (requires passcode)
    if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    const { updateThreadMessage } = await import('@/lib/kv/ask')
    const updatedQuestion = await updateThreadMessage(id, messageId, body, imageUrl, cleanImageUrls)
    
    if (!updatedQuestion) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    revalidateTag(ASK_QUESTIONS_TAG, 'max')
    return NextResponse.json({ question: updatedQuestion }, { status: 200 })
  } else {
    // Visitor follow-up — no passcode needed, but the question must already have an admin reply
    if (typeof body !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const trimmedBody = body.trim()
    if (trimmedBody.length === 0) {
      return NextResponse.json({ error: 'Follow-up cannot be empty' }, { status: 400 })
    }
    if (trimmedBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: 'Follow-up is too long' }, { status: 400 })
    }

    const { followUpQuestion } = await import('@/lib/kv/ask')
    const updatedQuestion = await followUpQuestion(id, trimmedBody, imageUrl, cleanImageUrls)

    if (!updatedQuestion) {
      return NextResponse.json({ error: 'Question not found or no admin reply yet' }, { status: 404 })
    }
    revalidateTag(ASK_QUESTIONS_TAG, 'max')

    after(async () => {
      try {
        await notifyOwnerNewQuestion(
          updatedQuestion.author || 'anonymous',
          `[Follow-up] ${trimmedBody}`
        )
      } catch (err) {
        console.error('Follow-up notification error (non-blocking):', err)
      }
    })

    return NextResponse.json({ question: updatedQuestion }, { status: 200 })
  }
}
