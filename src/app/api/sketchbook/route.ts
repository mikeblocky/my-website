import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildDrawingPayload, saveDrawing, incrementDrawingLikes, deleteDrawing, replyToDrawing, updateThreadMessage } from '@/lib/kv/sketchbook'
import { SKETCHBOOK_DRAWINGS_TAG, getSketchbookDrawings } from '@/lib/kv/sketchbook-cache'
import { getMessageCooldown, reserveMessageCooldown } from '@/lib/kv/cooldown'

const MAX_BODY_LENGTH = 300

export async function GET(request: NextRequest) {
  const [drawings, cooldown] = await Promise.all([
    getSketchbookDrawings(),
    getMessageCooldown('sketchbook', request)
  ])

  return NextResponse.json(
    { drawings, cooldown },
    {
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    }
  )
}

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.imageUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid payload: Drawing image is required.' }, { status: 400 })
  }

  // Basic base64 image validation
  if (!data.imageUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid payload: Image must be a valid data URL.' }, { status: 400 })
  }

  // Prevent enormous payload sizes (e.g. > 4MB base64 string)
  if (data.imageUrl.length > 5_000_000) {
    return NextResponse.json({ error: 'Drawing is too large.' }, { status: 413 })
  }

  const reservation = await reserveMessageCooldown('sketchbook', request)
  if (reservation.blocked) {
    return NextResponse.json(
      { error: 'Please wait before uploading another drawing.', cooldown: reservation.cooldown },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
        }
      }
    )
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous'
  const body = typeof data.body === 'string' ? data.body.trim() : undefined

  if (body && body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Caption is too long.' }, { status: 400 })
  }

  const drawing = buildDrawingPayload({ author, body, imageUrl: data.imageUrl })

  await saveDrawing(drawing)
  revalidateTag(SKETCHBOOK_DRAWINGS_TAG, 'max')

  return NextResponse.json({ drawing, cooldown: reservation.cooldown }, { status: 201 })
}

/** Likes or Admin Replies */
export async function PUT(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, action, reply, messageId, body, passcode, imageUrl } = data

  // Public visitor action: Like
  if (action === 'like') {
    const updated = await incrementDrawingLikes(id)
    if (!updated) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 })
    }
    revalidateTag(SKETCHBOOK_DRAWINGS_TAG, 'max')
    return NextResponse.json({ drawing: updated }, { status: 200 })
  }

  // Admin action validation
  if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (messageId) {
    // Edit existing thread message (requires passcode)
    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }
    const updated = await updateThreadMessage(id, messageId, body, imageUrl)
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    revalidateTag(SKETCHBOOK_DRAWINGS_TAG, 'max')
    return NextResponse.json({ drawing: updated }, { status: 200 })
  } else {
    // Post reply (requires passcode)
    if (typeof reply !== 'string' || reply.trim().length === 0) {
      return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 })
    }
    const updated = await replyToDrawing(id, reply, imageUrl)
    if (!updated) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 })
    }
    revalidateTag(SKETCHBOOK_DRAWINGS_TAG, 'max')
    return NextResponse.json({ drawing: updated }, { status: 200 })
  }
}

/** Admin delete a post */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const passcode = searchParams.get('passcode')

  if (!id) {
    return NextResponse.json({ error: 'Missing drawing ID' }, { status: 400 })
  }

  if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const success = await deleteDrawing(id)
  if (!success) {
    return NextResponse.json({ error: 'Drawing not found' }, { status: 404 })
  }
  
  revalidateTag(SKETCHBOOK_DRAWINGS_TAG, 'max')
  return NextResponse.json({ success: true }, { status: 200 })
}
