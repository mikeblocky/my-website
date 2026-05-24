import { after, NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildTalkPayload, saveTalk } from '@/lib/kv/talk'
import { TALK_MESSAGES_TAG, getTalkMessages } from '@/lib/kv/talk-cache'
import { notifyOwnerNewTalk } from '@/lib/notify/discord'
import { getSubscribedTalkIds } from '@/lib/kv/push'
import { getMessageCooldown, reserveMessageCooldown } from '@/lib/kv/cooldown'
import { validateImageUrls } from '@/lib/images/attachment-limits'

const MAX_BODY_LENGTH = 800

export async function GET(request: NextRequest) {
  const [talks, subscribedIds] = await Promise.all([
    getTalkMessages(),
    getSubscribedTalkIds()
  ])
  const cooldown = await getMessageCooldown('talk', request)

  const enriched = talks.map(t => ({
    ...t,
    notifying: subscribedIds.has(t.id)
  }))

  return NextResponse.json(
    { questions: enriched, cooldown }, // Keep JSON payload key questions/talks compatible or change to talks.
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
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
  }

  const reservation = await reserveMessageCooldown('talk', request)
  if (reservation.blocked) {
    return NextResponse.json(
      { error: 'Please wait before sending another message.', cooldown: reservation.cooldown },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
        }
      }
    )
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous'
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : undefined
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: any) => typeof url === 'string')
    : undefined
  const imageError = validateImageUrls(imageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }
  const talk = buildTalkPayload({ author, body, imageUrl, imageUrls })

  await saveTalk(talk)
  revalidateTag(TALK_MESSAGES_TAG, 'max')

  after(async () => {
    await notifyOwnerNewTalk(author, body)
  })

  return NextResponse.json({ question: talk, cooldown: reservation.cooldown }, { status: 201 })
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
  const imageError = validateImageUrls(cleanImageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }

  const updatedTalk = await import('@/lib/kv/talk').then(m => m.replyToTalk(id, reply, imageUrl, cleanImageUrls))
  
  if (!updatedTalk) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  revalidateTag(TALK_MESSAGES_TAG, 'max')

  after(async () => {
    try {
      const { getSubscriptionsForTalk } = await import('@/lib/kv/push')
      const subscriptions = await getSubscriptionsForTalk(id)
      
      if (subscriptions.length > 0) {
        const webpush = await import('web-push')
        
        webpush.default.setVapidDetails(
          'mailto:contact@mikeblocky.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!
        )

        const notificationPayload = JSON.stringify({
          title: 'mikeblocky responded to your post!',
          body: reply.trim().length > 120 ? reply.trim().slice(0, 120) + '...' : reply.trim(),
          url: '/talk',
          tag: `talk-${id}`
        })

        for (const sub of subscriptions) {
          try {
            await webpush.default.sendNotification(sub.subscription as any, notificationPayload)
          } catch (pushError: any) {
            console.error('Push notification failed for subscription:', pushError?.statusCode)
          }
        }
      }
    } catch (pushError) {
      console.error('Push notification error (non-blocking):', pushError)
    }
  })

  return NextResponse.json({ question: updatedTalk }, { status: 200 })
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
  const imageError = validateImageUrls(cleanImageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }

  if (messageId) {
    // Edit an existing message (requires passcode)
    if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    const { updateThreadMessage } = await import('@/lib/kv/talk')
    const updatedTalk = await updateThreadMessage(id, messageId, body, imageUrl, cleanImageUrls)
    
    if (!updatedTalk) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    revalidateTag(TALK_MESSAGES_TAG, 'max')
    return NextResponse.json({ question: updatedTalk }, { status: 200 })
  } else {
    // Visitor follow-up — no passcode needed, but the post must already have an admin reply
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

    const reservation = await reserveMessageCooldown('talk', request)
    if (reservation.blocked) {
      return NextResponse.json(
        { error: 'Please wait before sending another message.', cooldown: reservation.cooldown },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
          }
        }
      )
    }

    const { followUpTalk } = await import('@/lib/kv/talk')
    const updatedTalk = await followUpTalk(id, trimmedBody, imageUrl, cleanImageUrls)

    if (!updatedTalk) {
      return NextResponse.json({ error: 'Post not found or no admin reply yet' }, { status: 404 })
    }
    revalidateTag(TALK_MESSAGES_TAG, 'max')

    after(async () => {
      try {
        await notifyOwnerNewTalk(
          updatedTalk.author || 'anonymous',
          `[Follow-up] ${trimmedBody}`
        )
      } catch (err) {
        console.error('Follow-up notification error (non-blocking):', err)
      }
    })

    return NextResponse.json({ question: updatedTalk, cooldown: reservation.cooldown }, { status: 200 })
  }
}
