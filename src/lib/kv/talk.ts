import { getRedisClient, talkMessagesKey } from './client'
import { TalkTopic, ThreadMessage } from '@/app/talk/_types/talk'

const MAX_STORED_TALKS = 200

export function buildTalkPayload(partial: { author: string; body: string; imageUrl?: string; imageUrls?: string[] }): TalkTopic {
  const now = new Date().toISOString()
  return {
    id: Math.random().toString(36).substring(2, 11),
    author: partial.author.trim() || 'anonymous',
    body: partial.body.trim(),
    createdAt: now,
    imageUrl: partial.imageUrl,
    imageUrls: partial.imageUrls,
    thread: []
  }
}

export async function saveTalk(talk: TalkTopic) {
  const redis = await getRedisClient()
  const member = JSON.stringify(talk)
  const score = new Date(talk.createdAt).getTime()

  await redis.zAdd(talkMessagesKey, [{ score, value: member }])

  const total = await redis.zCard(talkMessagesKey)
  const surplus = total - MAX_STORED_TALKS
  if (surplus > 0) {
    await redis.zRemRangeByRank(talkMessagesKey, 0, surplus - 1)
  }
}

export async function fetchTalks(limit = 100): Promise<TalkTopic[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(talkMessagesKey, -limit, -1, { REV: true })
  return raw
    .map((entry: string) => {
      try {
        const t = JSON.parse(entry) as TalkTopic
        // Migrate legacy flat reply to thread format
        if (t.reply && (!t.thread || t.thread.length === 0)) {
          t.thread = [{
            id: `legacy-reply-${t.id}`,
            role: 'admin',
            body: t.reply,
            createdAt: t.repliedAt || t.createdAt
          }]
        }
        if (!t.thread) t.thread = []
        return t
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as TalkTopic[]
}

/** Admin replies to a talk (appends an admin message to the thread) */
export async function replyToTalk(id: string, replyBody: string, imageUrl?: string, imageUrls?: string[]): Promise<TalkTopic | null> {
  const redis = await getRedisClient()
  const talks = await fetchTalks(MAX_STORED_TALKS)
  
  const target = talks.find(t => t.id === id)
  if (!target) return null
  
  // Build old member from raw Redis data (re-fetch raw to avoid migration artifacts)
  const rawAll = await redis.zRange(talkMessagesKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const now = new Date().toISOString()
  const newMessage: ThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'admin',
    body: replyBody.trim(),
    createdAt: now,
    imageUrl,
    imageUrls
  }

  const updatedTalk: TalkTopic = {
    ...target,
    // Keep legacy fields for the first admin reply for backwards compat
    reply: target.reply || replyBody.trim(),
    repliedAt: target.repliedAt || now,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedTalk)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(talkMessagesKey, rawMember)
  await redis.zAdd(talkMessagesKey, [{ score, value: newMember }])
  
  return updatedTalk
}

/** Visitor follows up on a talk (appends an asker message to the thread) */
export async function followUpTalk(id: string, followUpBody: string, imageUrl?: string, imageUrls?: string[]): Promise<TalkTopic | null> {
  const redis = await getRedisClient()
  const talks = await fetchTalks(MAX_STORED_TALKS)
  
  const target = talks.find(t => t.id === id)
  if (!target) return null
  
  // Must have at least one admin reply before the visitor can follow up
  const hasAdminReply = target.thread?.some(m => m.role === 'admin')
  if (!hasAdminReply) return null

  const rawAll = await redis.zRange(talkMessagesKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const newMessage: ThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'asker',
    body: followUpBody.trim(),
    createdAt: new Date().toISOString(),
    imageUrl,
    imageUrls
  }

  const updatedTalk: TalkTopic = {
    ...target,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedTalk)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(talkMessagesKey, rawMember)
  await redis.zAdd(talkMessagesKey, [{ score, value: newMember }])
  
  return updatedTalk
}

export async function getTalkById(id: string): Promise<TalkTopic | null> {
  const talks = await fetchTalks(MAX_STORED_TALKS)
  return talks.find(t => t.id === id) || null
}

/** Updates an existing thread message body */
export async function updateThreadMessage(
  talkId: string, 
  messageId: string, 
  newBody: string, 
  newImageUrl?: string,
  newImageUrls?: string[]
): Promise<TalkTopic | null> {
  const redis = await getRedisClient()
  const talks = await fetchTalks(MAX_STORED_TALKS)
  
  const target = talks.find(t => t.id === talkId)
  if (!target || !target.thread) return null
  
  const messageIndex = target.thread.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return null

  const rawAll = await redis.zRange(talkMessagesKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === talkId } catch { return false }
  })
  if (!rawMember) return null

  const updatedThread = [...target.thread]
  updatedThread[messageIndex] = {
    ...updatedThread[messageIndex],
    body: newBody.trim(),
    imageUrl: newImageUrl !== undefined ? newImageUrl : updatedThread[messageIndex].imageUrl,
    imageUrls: newImageUrls !== undefined ? newImageUrls : updatedThread[messageIndex].imageUrls
  }

  const updatedTalk: TalkTopic = {
    ...target,
    thread: updatedThread
  }
  
  // Update legacy field if this was the first admin reply
  const isFirstAdminReply = target.thread.findIndex(m => m.role === 'admin') === messageIndex
  if (isFirstAdminReply) {
    updatedTalk.reply = newBody.trim()
  }
  
  const newMember = JSON.stringify(updatedTalk)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(talkMessagesKey, rawMember)
  await redis.zAdd(talkMessagesKey, [{ score, value: newMember }])
  
  return updatedTalk
}
