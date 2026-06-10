import { MediaSuggestion, SuggestionStatus, SuggestionThreadMessage } from '@/app/suggestions/_types/suggestion'
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
    imageUrls: partial.imageUrls,
    thread: []
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

export async function getSuggestionById(id: string): Promise<MediaSuggestion | null> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(suggestionsKey, 0, -1)

  for (const entry of raw) {
    try {
      const parsed = JSON.parse(entry) as MediaSuggestion
      if (parsed.id === id) return parsed
    } catch (_error) {}
  }

  return null
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus
): Promise<MediaSuggestion | null> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(suggestionsKey, 0, -1)

  let targetSuggestion: MediaSuggestion | null = null
  let originalMember: string | null = null

  for (const entry of raw) {
    try {
      const parsed = JSON.parse(entry) as MediaSuggestion
      if (parsed.id === id) {
        targetSuggestion = parsed
        originalMember = entry
        break
      }
    } catch (_error) {}
  }

  if (!targetSuggestion || !originalMember) return null

  // Remove the old entry
  await redis.zRem(suggestionsKey, originalMember)

  // Update the status
  targetSuggestion.status = status

  // Add the new entry back with the same score (timestamp)
  const score = new Date(targetSuggestion.createdAt).getTime()
  await redis.zAdd(suggestionsKey, [{ score, value: JSON.stringify(targetSuggestion) }])

  return targetSuggestion
}

export async function replyToSuggestion(
  id: string,
  replyBody: string,
  imageUrl?: string,
  imageUrls?: string[]
): Promise<MediaSuggestion | null> {
  const redis = await getRedisClient()
  const rawAll = await redis.zRange(suggestionsKey, 0, -1)

  let targetSuggestion: MediaSuggestion | null = null
  let originalMember: string | null = null

  for (const entry of rawAll) {
    try {
      const parsed = JSON.parse(entry) as MediaSuggestion
      if (parsed.id === id) {
        targetSuggestion = parsed
        originalMember = entry
        break
      }
    } catch (_error) {}
  }

  if (!targetSuggestion || !originalMember) return null

  const now = new Date().toISOString()
  const newMessage: SuggestionThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'admin',
    body: replyBody.trim(),
    createdAt: now,
    imageUrl,
    imageUrls
  }

  const updatedSuggestion: MediaSuggestion = {
    ...targetSuggestion,
    thread: [...(targetSuggestion.thread || []), newMessage]
  }

  await redis.zRem(suggestionsKey, originalMember)
  const score = new Date(targetSuggestion.createdAt).getTime()
  await redis.zAdd(suggestionsKey, [{ score, value: JSON.stringify(updatedSuggestion) }])

  return updatedSuggestion
}

export async function followUpSuggestion(
  id: string,
  followUpBody: string,
  imageUrl?: string,
  imageUrls?: string[]
): Promise<MediaSuggestion | null> {
  const redis = await getRedisClient()
  const rawAll = await redis.zRange(suggestionsKey, 0, -1)

  let targetSuggestion: MediaSuggestion | null = null
  let originalMember: string | null = null

  for (const entry of rawAll) {
    try {
      const parsed = JSON.parse(entry) as MediaSuggestion
      if (parsed.id === id) {
        targetSuggestion = parsed
        originalMember = entry
        break
      }
    } catch (_error) {}
  }

  if (!targetSuggestion || !originalMember) return null

  const newMessage: SuggestionThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'asker',
    body: followUpBody.trim(),
    createdAt: new Date().toISOString(),
    imageUrl,
    imageUrls
  }

  const updatedSuggestion: MediaSuggestion = {
    ...targetSuggestion,
    thread: [...(targetSuggestion.thread || []), newMessage]
  }

  await redis.zRem(suggestionsKey, originalMember)
  const score = new Date(targetSuggestion.createdAt).getTime()
  await redis.zAdd(suggestionsKey, [{ score, value: JSON.stringify(updatedSuggestion) }])

  return updatedSuggestion
}

export async function updateSuggestionThreadMessage(
  suggestionId: string,
  messageId: string,
  newBody: string,
  newImageUrl?: string,
  newImageUrls?: string[]
): Promise<MediaSuggestion | null> {
  const redis = await getRedisClient()
  const rawAll = await redis.zRange(suggestionsKey, 0, -1)

  let targetSuggestion: MediaSuggestion | null = null
  let originalMember: string | null = null

  for (const entry of rawAll) {
    try {
      const parsed = JSON.parse(entry) as MediaSuggestion
      if (parsed.id === suggestionId) {
        targetSuggestion = parsed
        originalMember = entry
        break
      }
    } catch (_error) {}
  }

  if (!targetSuggestion || !originalMember) return null

  // If messageId matches suggestionId, we are editing the original suggestion (the question)
  if (messageId === suggestionId) {
    const updatedSuggestion: MediaSuggestion = {
      ...targetSuggestion,
      note: newBody.trim(),
      imageUrl: newImageUrl !== undefined ? newImageUrl : targetSuggestion.imageUrl,
      imageUrls: newImageUrls !== undefined ? newImageUrls : targetSuggestion.imageUrls
    }

    await redis.zRem(suggestionsKey, originalMember)
    const score = new Date(targetSuggestion.createdAt).getTime()
    await redis.zAdd(suggestionsKey, [{ score, value: JSON.stringify(updatedSuggestion) }])

    return updatedSuggestion
  }

  if (!targetSuggestion.thread) return null
  const messageIndex = targetSuggestion.thread.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return null

  const updatedThread = [...targetSuggestion.thread]
  updatedThread[messageIndex] = {
    ...updatedThread[messageIndex],
    body: newBody.trim(),
    imageUrl: newImageUrl !== undefined ? newImageUrl : updatedThread[messageIndex].imageUrl,
    imageUrls: newImageUrls !== undefined ? newImageUrls : updatedThread[messageIndex].imageUrls
  }

  const updatedSuggestion: MediaSuggestion = {
    ...targetSuggestion,
    thread: updatedThread
  }

  await redis.zRem(suggestionsKey, originalMember)
  const score = new Date(targetSuggestion.createdAt).getTime()
  await redis.zAdd(suggestionsKey, [{ score, value: JSON.stringify(updatedSuggestion) }])

  return updatedSuggestion
}
