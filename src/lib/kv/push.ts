import { getRedisClient } from './client'

const PUSH_SUBSCRIPTIONS_KEY = 'ask:push-subscriptions'

export interface PushSubscriptionData {
  questionId: string
  subscription: PushSubscription
  createdAt: string
}

export async function savePushSubscription(questionId: string, subscription: PushSubscription) {
  const redis = await getRedisClient()
  const data: PushSubscriptionData = {
    questionId,
    subscription,
    createdAt: new Date().toISOString()
  }
  const member = JSON.stringify(data)
  const score = Date.now()
  await redis.zAdd(PUSH_SUBSCRIPTIONS_KEY, [{ score, value: member }])

  // Keep only last 500 subscriptions
  const total = await redis.zCard(PUSH_SUBSCRIPTIONS_KEY)
  const surplus = total - 500
  if (surplus > 0) {
    await redis.zRemRangeByRank(PUSH_SUBSCRIPTIONS_KEY, 0, surplus - 1)
  }
}

export async function getSubscriptionsForQuestion(questionId: string): Promise<PushSubscriptionData[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(PUSH_SUBSCRIPTIONS_KEY, 0, -1)
  return raw
    .map((entry: string) => {
      try {
        return JSON.parse(entry) as PushSubscriptionData
      } catch {
        return null
      }
    })
    .filter((item): item is PushSubscriptionData => item !== null && item.questionId === questionId)
}

export async function removeSubscription(questionId: string) {
  const redis = await getRedisClient()
  const raw = await redis.zRange(PUSH_SUBSCRIPTIONS_KEY, 0, -1)
  for (const entry of raw) {
    try {
      const parsed = JSON.parse(entry) as PushSubscriptionData
      if (parsed.questionId === questionId) {
        await redis.zRem(PUSH_SUBSCRIPTIONS_KEY, entry)
      }
    } catch {
      // skip invalid entries
    }
  }
}
