import { MediaSuggestion } from '@/app/suggestions/_types/suggestion'
import { getRedisClient, suggestionsKey } from './client'

const MAX_STORED_SUGGESTIONS = 250

export function buildSuggestionPayload(partial: {
  author: string
  title: string
  category: MediaSuggestion['category']
  note?: string
  bestPart?: string
  reference?: MediaSuggestion['reference']
  imageUrl?: string
  imageUrls?: string[]
}): MediaSuggestion {
  return {
    id: Math.random().toString(36).substring(2, 11),
    author: partial.author.trim() || 'anonymous',
    title: partial.title.trim(),
    category: partial.category,
    note: partial.note?.trim() || undefined,
    bestPart: partial.bestPart?.trim() || undefined,
    reference: partial.reference,
    createdAt: new Date().toISOString(),
    imageUrl: partial.imageUrl,
    imageUrls: partial.imageUrls
  }
}

export async function saveSuggestion(suggestion: MediaSuggestion) {
  const redis = await getRedisClient()
  const member = JSON.stringify(suggestion)
  const score = new Date(suggestion.createdAt).getTime()

  await redis.zAdd(suggestionsKey, [{ score, value: member }])

  const total = await redis.zCard(suggestionsKey)
  const surplus = total - MAX_STORED_SUGGESTIONS
  if (surplus > 0) {
    await redis.zRemRangeByRank(suggestionsKey, 0, surplus - 1)
  }
}

export async function fetchSuggestions(limit = 100): Promise<MediaSuggestion[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(suggestionsKey, -limit, -1, { REV: true })

  return raw
    .map((entry: string) => {
      try {
        return JSON.parse(entry) as MediaSuggestion
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as MediaSuggestion[]
}
