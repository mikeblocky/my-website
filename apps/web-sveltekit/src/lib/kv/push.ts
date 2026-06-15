import { getRedisClient } from './client'

const PUSH_SUBSCRIPTIONS_KEY = 'talk:push-subscriptions'

export interface PushSubscriptionData {
  talkId: string
  subscription: PushSubscription
  createdAt: string
}

export async function savePushSubscription(talkId: string, subscription: PushSubscription) {
  const redis = await getRedisClient()
  const data: PushSubscriptionData = {
    talkId,
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

export async function getSubscriptionsForTalk(talkId: string): Promise<PushSubscriptionData[]> {
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
    .filter((item): item is PushSubscriptionData => item !== null && item.talkId === talkId)
}

export async function getSubscribedTalkIds(): Promise<Set<string>> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(PUSH_SUBSCRIPTIONS_KEY, 0, -1)
  const ids = new Set<string>()
  for (const entry of raw) {
    try {
      const parsed = JSON.parse(entry) as PushSubscriptionData
      ids.add(parsed.talkId)
    } catch {
      // skip invalid entries
    }
  }
  return ids
}

export async function removeTalkSubscription(talkId: string) {
  const redis = await getRedisClient()
  const raw = await redis.zRange(PUSH_SUBSCRIPTIONS_KEY, 0, -1)
  for (const entry of raw) {
    try {
      const parsed = JSON.parse(entry) as PushSubscriptionData
      if (parsed.talkId === talkId) {
        await redis.zRem(PUSH_SUBSCRIPTIONS_KEY, entry)
      }
    } catch {
      // skip invalid entries
    }
  }
}
