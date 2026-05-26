import { after, NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { buildSuggestionPayload, saveSuggestion } from '@/lib/kv/suggestions'
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
