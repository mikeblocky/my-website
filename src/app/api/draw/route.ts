import { after, NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildPromptPayload, savePrompt } from '@/lib/kv/draw'
import { DRAW_PROMPTS_TAG, getDrawPrompts } from '@/lib/kv/draw-cache'
import { notifyOwnerNewPrompt } from '@/lib/notify/discord'
import { getMessageCooldown, reserveMessageCooldown } from '@/lib/kv/cooldown'

const MAX_BODY_LENGTH = 800

export async function GET(request: NextRequest) {
  const [prompts, cooldown] = await Promise.all([
    getDrawPrompts(),
    getMessageCooldown('draw', request)
  ])

  return NextResponse.json(
    { prompts, cooldown },
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
    return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 })
  }

  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Prompt is too long' }, { status: 400 })
  }

  const reservation = await reserveMessageCooldown('draw', request)
  if (reservation.blocked) {
    return NextResponse.json(
      { error: 'Please wait before sending another prompt.', cooldown: reservation.cooldown },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
        }
      }
    )
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous'
  const character = typeof data.character === 'string' ? data.character : undefined
  const media = typeof data.media === 'string' ? data.media : undefined
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl : undefined
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: any) => typeof url === 'string')
    : undefined
  const prompt = buildPromptPayload({ author, body, character, media, imageUrl, imageUrls })

  await savePrompt(prompt)
  revalidateTag(DRAW_PROMPTS_TAG, 'max')

  after(async () => {
    await notifyOwnerNewPrompt(author, body)
  })

  return NextResponse.json({ prompt, cooldown: reservation.cooldown }, { status: 201 })
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

  const updatedPrompt = await import('@/lib/kv/draw').then(m => m.replyToPrompt(id, reply, imageUrl, cleanImageUrls))
  
  if (!updatedPrompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }
  revalidateTag(DRAW_PROMPTS_TAG, 'max')

  return NextResponse.json({ prompt: updatedPrompt }, { status: 200 })
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

    const { updateThreadMessage } = await import('@/lib/kv/draw')
    const updatedPrompt = await updateThreadMessage(id, messageId, body, imageUrl, cleanImageUrls)
    
    if (!updatedPrompt) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    revalidateTag(DRAW_PROMPTS_TAG, 'max')
    return NextResponse.json({ prompt: updatedPrompt }, { status: 200 })
  } else {
    // Visitor follow-up — no passcode needed, but the prompt must already have an admin reply
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

    const reservation = await reserveMessageCooldown('draw', request)
    if (reservation.blocked) {
      return NextResponse.json(
        { error: 'Please wait before sending another prompt.', cooldown: reservation.cooldown },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
          }
        }
      )
    }

    const { followUpPrompt } = await import('@/lib/kv/draw')
    const updatedPrompt = await followUpPrompt(id, trimmedBody, imageUrl, cleanImageUrls)

    if (!updatedPrompt) {
      return NextResponse.json({ error: 'Prompt not found or no admin reply yet' }, { status: 404 })
    }
    revalidateTag(DRAW_PROMPTS_TAG, 'max')

    after(async () => {
      try {
        await notifyOwnerNewPrompt(
          updatedPrompt.author || 'anonymous',
          `[Follow-up] ${trimmedBody}`
        )
      } catch (err) {
        console.error('Follow-up notification error (non-blocking):', err)
      }
    })

    return NextResponse.json({ prompt: updatedPrompt, cooldown: reservation.cooldown }, { status: 200 })
  }
}
