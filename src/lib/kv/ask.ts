import { getRedisClient, askQuestionsKey } from './client'
import { AskQuestion, ThreadMessage } from '@/app/ask/_types/ask'

const MAX_STORED_QUESTIONS = 200

export function buildQuestionPayload(partial: { author: string; body: string }): AskQuestion {
  const now = new Date().toISOString()
  return {
    id: Math.random().toString(36).substring(2, 11),
    author: partial.author.trim() || 'anonymous',
    body: partial.body.trim(),
    createdAt: now,
    thread: []
  }
}

export async function saveQuestion(question: AskQuestion) {
  const redis = await getRedisClient()
  const member = JSON.stringify(question)
  const score = new Date(question.createdAt).getTime()

  await redis.zAdd(askQuestionsKey, [{ score, value: member }])

  const total = await redis.zCard(askQuestionsKey)
  const surplus = total - MAX_STORED_QUESTIONS
  if (surplus > 0) {
    await redis.zRemRangeByRank(askQuestionsKey, 0, surplus - 1)
  }
}

export async function fetchQuestions(limit = 100): Promise<AskQuestion[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(askQuestionsKey, -limit, -1, { REV: true })
  return raw
    .map((entry: string) => {
      try {
        const q = JSON.parse(entry) as AskQuestion
        // Migrate legacy flat reply to thread format
        if (q.reply && (!q.thread || q.thread.length === 0)) {
          q.thread = [{
            id: `legacy-reply-${q.id}`,
            role: 'admin',
            body: q.reply,
            createdAt: q.repliedAt || q.createdAt
          }]
        }
        if (!q.thread) q.thread = []
        return q
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as AskQuestion[]
}

/** Admin replies to a question (appends an admin message to the thread) */
export async function replyToQuestion(id: string, replyBody: string): Promise<AskQuestion | null> {
  const redis = await getRedisClient()
  const questions = await fetchQuestions(MAX_STORED_QUESTIONS)
  
  const target = questions.find(q => q.id === id)
  if (!target) return null
  
  // Build old member from raw Redis data (re-fetch raw to avoid migration artifacts)
  const rawAll = await redis.zRange(askQuestionsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const now = new Date().toISOString()
  const newMessage: ThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'admin',
    body: replyBody.trim(),
    createdAt: now
  }

  const updatedQuestion: AskQuestion = {
    ...target,
    // Keep legacy fields for the first admin reply for backwards compat
    reply: target.reply || replyBody.trim(),
    repliedAt: target.repliedAt || now,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedQuestion)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(askQuestionsKey, rawMember)
  await redis.zAdd(askQuestionsKey, [{ score, value: newMember }])
  
  return updatedQuestion
}

/** Visitor follows up on a question (appends an asker message to the thread) */
export async function followUpQuestion(id: string, followUpBody: string): Promise<AskQuestion | null> {
  const redis = await getRedisClient()
  const questions = await fetchQuestions(MAX_STORED_QUESTIONS)
  
  const target = questions.find(q => q.id === id)
  if (!target) return null
  
  // Must have at least one admin reply before the visitor can follow up
  const hasAdminReply = target.thread?.some(m => m.role === 'admin')
  if (!hasAdminReply) return null

  const rawAll = await redis.zRange(askQuestionsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const newMessage: ThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'asker',
    body: followUpBody.trim(),
    createdAt: new Date().toISOString()
  }

  const updatedQuestion: AskQuestion = {
    ...target,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedQuestion)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(askQuestionsKey, rawMember)
  await redis.zAdd(askQuestionsKey, [{ score, value: newMember }])
  
  return updatedQuestion
}

export async function getQuestionById(id: string): Promise<AskQuestion | null> {
  const questions = await fetchQuestions(MAX_STORED_QUESTIONS)
  return questions.find(q => q.id === id) || null
}
