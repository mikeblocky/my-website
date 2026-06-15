import { getRedisClient, drawPromptsKey } from './client'
import type { DrawPrompt, ThreadMessage as DrawThreadMessage } from '@mikeblocky/site-data'

const MAX_STORED_PROMPTS = 200

export function buildPromptPayload(partial: { 
  author: string; 
  body: string; 
  character?: string; 
  media?: string; 
  imageUrl?: string;
  imageUrls?: string[];
}): DrawPrompt {
  const now = new Date().toISOString()
  return {
    id: Math.random().toString(36).substring(2, 11),
    author: partial.author.trim() || 'anonymous',
    body: partial.body.trim(),
    createdAt: now,
    character: partial.character?.trim(),
    media: partial.media?.trim(),
    imageUrl: partial.imageUrl,
    imageUrls: partial.imageUrls,
    thread: []
  }
}

export async function savePrompt(prompt: DrawPrompt) {
  const redis = await getRedisClient()
  const member = JSON.stringify(prompt)
  const score = new Date(prompt.createdAt).getTime()

  await redis.zAdd(drawPromptsKey, [{ score, value: member }])

  const total = await redis.zCard(drawPromptsKey)
  const surplus = total - MAX_STORED_PROMPTS
  if (surplus > 0) {
    await redis.zRemRangeByRank(drawPromptsKey, 0, surplus - 1)
  }
}

export async function fetchPrompts(limit = 100): Promise<DrawPrompt[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(drawPromptsKey, -limit, -1, { REV: true })
  return raw
    .map((entry: string) => {
      try {
        const p = JSON.parse(entry) as DrawPrompt
        if (!p.thread) p.thread = []
        return p
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as DrawPrompt[]
}

export async function replyToPrompt(id: string, replyBody: string, imageUrl?: string, imageUrls?: string[]): Promise<DrawPrompt | null> {
  const redis = await getRedisClient()
  const prompts = await fetchPrompts(MAX_STORED_PROMPTS)
  
  const target = prompts.find(p => p.id === id)
  if (!target) return null
  
  // Build old member from raw Redis data (re-fetch raw to avoid migration artifacts)
  const rawAll = await redis.zRange(drawPromptsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const now = new Date().toISOString()
  const newMessage: DrawThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'admin',
    body: replyBody.trim(),
    createdAt: now,
    imageUrl,
    imageUrls
  }

  const updatedPrompt: DrawPrompt = {
    ...target,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedPrompt)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(drawPromptsKey, rawMember)
  await redis.zAdd(drawPromptsKey, [{ score, value: newMember }])
  
  return updatedPrompt
}

export async function followUpPrompt(id: string, followUpBody: string, imageUrl?: string, imageUrls?: string[]): Promise<DrawPrompt | null> {
  const redis = await getRedisClient()
  const prompts = await fetchPrompts(MAX_STORED_PROMPTS)
  
  const target = prompts.find(p => p.id === id)
  if (!target) return null
  
  const rawAll = await redis.zRange(drawPromptsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const newMessage: DrawThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'asker',
    body: followUpBody.trim(),
    createdAt: new Date().toISOString(),
    imageUrl,
    imageUrls
  }

  const updatedPrompt: DrawPrompt = {
    ...target,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedPrompt)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(drawPromptsKey, rawMember)
  await redis.zAdd(drawPromptsKey, [{ score, value: newMember }])
  
  return updatedPrompt
}

export async function getPromptById(id: string): Promise<DrawPrompt | null> {
  const prompts = await fetchPrompts(MAX_STORED_PROMPTS)
  return prompts.find(p => p.id === id) || null
}

export async function updateThreadMessage(
  promptId: string, 
  messageId: string, 
  newBody: string, 
  newImageUrl?: string,
  newImageUrls?: string[]
): Promise<DrawPrompt | null> {
  const redis = await getRedisClient()
  const prompts = await fetchPrompts(MAX_STORED_PROMPTS)
  
  const target = prompts.find(p => p.id === promptId)
  if (!target) return null
  
  const rawAll = await redis.zRange(drawPromptsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === promptId } catch { return false }
  })
  if (!rawMember) return null

  // If messageId matches promptId, we are editing the original prompt (the question)
  if (messageId === promptId) {
    const updatedPrompt: DrawPrompt = {
      ...target,
      body: newBody.trim(),
      imageUrl: newImageUrl !== undefined ? newImageUrl : target.imageUrl,
      imageUrls: newImageUrls !== undefined ? newImageUrls : target.imageUrls
    }
    const newMember = JSON.stringify(updatedPrompt)
    const score = new Date(target.createdAt).getTime()

    await redis.zRem(drawPromptsKey, rawMember)
    await redis.zAdd(drawPromptsKey, [{ score, value: newMember }])

    return updatedPrompt
  }

  if (!target.thread) return null
  const messageIndex = target.thread.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return null

  const updatedThread = [...target.thread]
  updatedThread[messageIndex] = {
    ...updatedThread[messageIndex],
    body: newBody.trim(),
    imageUrl: newImageUrl !== undefined ? newImageUrl : updatedThread[messageIndex].imageUrl,
    imageUrls: newImageUrls !== undefined ? newImageUrls : updatedThread[messageIndex].imageUrls
  }

  const updatedPrompt: DrawPrompt = {
    ...target,
    thread: updatedThread
  }
  
  const newMember = JSON.stringify(updatedPrompt)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(drawPromptsKey, rawMember)
  await redis.zAdd(drawPromptsKey, [{ score, value: newMember }])
  
  return updatedPrompt
}
