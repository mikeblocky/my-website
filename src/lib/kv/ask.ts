import { randomUUID } from 'crypto'
import { getRedisClient, askQuestionsKey } from './client'
import { AskQuestion } from '@/app/ask/_types/ask'

const MAX_STORED_QUESTIONS = 200

export function buildQuestionPayload(partial: { author: string; body: string }): AskQuestion {
  const now = new Date().toISOString()
  return {
    id: randomUUID(),
    author: partial.author.trim() || 'anonymous',
    body: partial.body.trim(),
    createdAt: now
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
        return JSON.parse(entry) as AskQuestion
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as AskQuestion[]
}

export async function replyToQuestion(id: string, replyBody: string): Promise<AskQuestion | null> {
  const redis = await getRedisClient()
  const questions = await fetchQuestions(MAX_STORED_QUESTIONS)
  
  const target = questions.find(q => q.id === id)
  if (!target) return null
  
  const oldMember = JSON.stringify(target)
  
  const updatedQuestion: AskQuestion = {
    ...target,
    reply: replyBody.trim(),
    repliedAt: new Date().toISOString()
  }
  
  const newMember = JSON.stringify(updatedQuestion)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(askQuestionsKey, oldMember)
  await redis.zAdd(askQuestionsKey, [{ score, value: newMember }])
  
  return updatedQuestion
}
