import { after, NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildSuggestionPayload, saveSuggestion, updateSuggestionStatus, replyToSuggestion, followUpSuggestion, updateSuggestionThreadMessage } from '@/lib/kv/suggestions'
import { SUGGESTIONS_TAG, getMediaSuggestions } from '@/lib/kv/suggestions-cache'
import { getMessageCooldown, reserveMessageCooldown } from '@/lib/kv/cooldown'
import { validateImageUrls } from '@/lib/images/attachment-limits'
import { notifyOwnerNewSuggestion } from '@/lib/notify/discord'
import { getAutomaticReference } from '@/app/suggestions/_utils/reference'
import type { SuggestionCategory, SuggestionReference } from '@/app/suggestions/_types/suggestion'

const MAX_TEXT_LENGTH = 800
const categories: SuggestionCategory[] = ['manga', 'anime', 'film', 'series', 'book', 'game', 'music', 'other']

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : undefined
}

function cleanReference(value: unknown): SuggestionReference | undefined {
  if (!value || typeof value !== 'object') return undefined

  const reference = value as Record<string, unknown>
  const url = cleanText(reference.url)
  if (!url) return undefined

  return {
    url,
    title: cleanText(reference.title),
    description: cleanText(reference.description),
    image: cleanText(reference.image),
    siteName: cleanText(reference.siteName),
    type: cleanText(reference.type)
  }
}

export async function GET(request: NextRequest) {
  const [suggestions, cooldown] = await Promise.all([
    getMediaSuggestions(),
    getMessageCooldown('suggestion', request)
  ])

  return NextResponse.json(
    { suggestions, cooldown },
    {
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    }
  )
}

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.title !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const title = data.title.trim()
  if (title.length === 0) {
    return NextResponse.json({ error: 'Suggestion title cannot be empty' }, { status: 400 })
  }

  const note = cleanText(data.note)
  const bestPart = cleanText(data.bestPart)
  if ((note?.length || 0) > MAX_TEXT_LENGTH || (bestPart?.length || 0) > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'Suggestion details are too long' }, { status: 400 })
  }

  const reservation = await reserveMessageCooldown('suggestion', request)
  if (reservation.blocked) {
    return NextResponse.json(
      { error: 'Please wait before sending another suggestion.', cooldown: reservation.cooldown },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(reservation.cooldown.remainingMs / 1000).toString()
        }
      }
    )
  }

  const category = typeof data.category === 'string' && categories.includes(data.category as SuggestionCategory)
    ? data.category as SuggestionCategory
    : 'other'
  const author = cleanText(data.author) || 'anonymous'
  const imageUrl = cleanText(data.imageUrl)
  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url: unknown): url is string => typeof url === 'string')
    : undefined
  const imageError = validateImageUrls(imageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }

  let reference = cleanReference(data.reference)
  if (!reference) {
    reference = getAutomaticReference(title, category)
  }

  const suggestion = buildSuggestionPayload({
    author,
    title,
    category,
    note,
    bestPart,
    reference,
    imageUrl,
    imageUrls
  })

  await saveSuggestion(suggestion)
  revalidateTag(SUGGESTIONS_TAG, 'max')

  after(async () => {
    await notifyOwnerNewSuggestion(author, title, note)
  })

  return NextResponse.json({ suggestion, cooldown: reservation.cooldown }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string' || typeof data.reply !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, reply, passcode, imageUrl, imageUrls } = data

  if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
  }

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined
  const imageError = validateImageUrls(cleanImageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }

  const updated = await replyToSuggestion(id, reply, imageUrl, cleanImageUrls)
  if (!updated) {
    return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
  }

  revalidateTag(SUGGESTIONS_TAG, 'max')

  return NextResponse.json({ suggestion: updated }, { status: 200 })
}

export async function PATCH(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.id !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { id, status, body, messageId, passcode, imageUrl, imageUrls } = data

  const cleanImageUrls = Array.isArray(imageUrls)
    ? imageUrls.filter((url: any) => typeof url === 'string')
    : undefined
  const imageError = validateImageUrls(cleanImageUrls)
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 413 })
  }

  // Case 1: Edit an existing comment/message (requires passcode)
  if (messageId) {
    if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
    }
    if (typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    const updated = await updateSuggestionThreadMessage(id, messageId, body, imageUrl, cleanImageUrls)
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    revalidateTag(SUGGESTIONS_TAG, 'max')
    return NextResponse.json({ suggestion: updated }, { status: 200 })
  }

  // Case 2: Status update (requires passcode)
  if (status) {
    if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Incorrect passcode' }, { status: 401 })
    }
    const validStatuses = ['planning', 'progressing', 'completed', 'dropped']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updated = await updateSuggestionStatus(id, status as any)
    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }

    revalidateTag(SUGGESTIONS_TAG, 'max')
    return NextResponse.json({ suggestion: updated }, { status: 200 })
  }

  // Case 3: Visitor follow-up (no passcode needed, but suggestion must already have an admin reply)
  if (body) {
    const trimmedBody = body.trim()
    if (trimmedBody.length === 0) {
      return NextResponse.json({ error: 'Follow-up cannot be empty' }, { status: 400 })
    }

    const reservation = await reserveMessageCooldown('suggestion', request)
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

    const updated = await followUpSuggestion(id, trimmedBody, imageUrl, cleanImageUrls)
    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found or no admin reply yet' }, { status: 404 })
    }

    revalidateTag(SUGGESTIONS_TAG, 'max')
    return NextResponse.json({ suggestion: updated, cooldown: reservation.cooldown }, { status: 200 })
  }

  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
}
