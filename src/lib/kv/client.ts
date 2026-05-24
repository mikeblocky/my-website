import { createClient, RedisClientType } from 'redis'

export const askQuestionsKey = 'ask:questions'
export const talkMessagesKey = 'talk:messages'
export const drawPromptsKey = 'draw:prompts'
export const lastPetGiftKey = 'pet:last_gift'
export const totalPetGiftsKey = 'pet:total_gifts'

type RedisClient = RedisClientType<any, any, any>
type ZAddMember = { score: number; value: string }

type KvClient = {
	zAdd: (key: string, members: ZAddMember[]) => Promise<number>
	zCard: (key: string) => Promise<number>
	zRemRangeByRank: (key: string, start: number, stop: number) => Promise<number>
	zRange: (
		key: string,
		start: number,
		stop: number,
		options?: { REV?: boolean }
	) => Promise<string[]>
	zRem: (key: string, member: string) => Promise<number>
	set: (key: string, value: string) => Promise<string | null>
	get: (key: string) => Promise<string | null>
	incr: (key: string) => Promise<number>
}

declare global {
	var __redisClient: RedisClient | undefined
	var __memorySortedSets: Map<string, Array<{ score: number; value: string }>> | undefined
	var __memoryStrings: Map<string, string> | undefined
	var __redisUnavailable: boolean | undefined
}

const redisUrl = process.env.REDIS_URL

function getMemoryClient(): KvClient {
	if (!global.__memorySortedSets) {
		global.__memorySortedSets = new Map()
	}
	if (!global.__memoryStrings) {
		global.__memoryStrings = new Map()
	}

	const getSet = (key: string) => {
		const existing = global.__memorySortedSets?.get(key)
		if (existing) {
			return existing
		}
		const created: Array<{ score: number; value: string }> = []
		global.__memorySortedSets?.set(key, created)
		return created
	}

	return {
		async zAdd(key, members) {
			const set = getSet(key)
			let added = 0
			for (const member of members) {
				const index = set.findIndex((entry) => entry.value === member.value)
				if (index >= 0) {
					set[index] = { score: member.score, value: member.value }
				} else {
					set.push({ score: member.score, value: member.value })
					added += 1
				}
			}
			set.sort((a, b) => a.score - b.score)
			return added
		},
		async zCard(key) {
			return getSet(key).length
		},
		async zRemRangeByRank(key, start, stop) {
			const set = getSet(key)
			if (set.length === 0 || stop < start) {
				return 0
			}

			const boundedStart = Math.max(0, start)
			const boundedStop = Math.min(stop, set.length - 1)
			if (boundedStart > boundedStop) {
				return 0
			}

			const removed = boundedStop - boundedStart + 1
			set.splice(boundedStart, removed)
			return removed
		},
		async zRange(key, start, stop, options) {
			const set = getSet(key)
			if (set.length === 0) {
				return []
			}

			const values = options?.REV
				? [...set].reverse().map((entry) => entry.value)
				: set.map((entry) => entry.value)

			const length = values.length
			const normalize = (index: number) => (index < 0 ? length + index : index)
			const normalizedStart = Math.max(0, normalize(start))
			const normalizedStop = Math.min(length - 1, normalize(stop))

			if (normalizedStart > normalizedStop || normalizedStart >= length) {
				return []
			}

			return values.slice(normalizedStart, normalizedStop + 1)
		},
		async zRem(key, member) {
			const set = getSet(key)
			const index = set.findIndex((entry) => entry.value === member)
			if (index >= 0) {
				set.splice(index, 1)
				return 1
			}
			return 0
		},
		async set(key, value) {
			global.__memoryStrings?.set(key, value)
			return value
		},
		async get(key) {
			return global.__memoryStrings?.get(key) || null
		},
		async incr(key) {
			const current = global.__memoryStrings?.get(key)
			const next = (parseInt(current || '0', 10) + 1).toString()
			global.__memoryStrings?.set(key, next)
			return parseInt(next, 10)
		}
	}
}

export async function getRedisClient(): Promise<KvClient> {
	if (!redisUrl || global.__redisUnavailable) {
		return getMemoryClient()
	}

	if (global.__redisClient && global.__redisClient.isOpen) {
		return global.__redisClient
	}

	const client = createClient({ url: redisUrl }) as RedisClient
	client.on('error', (err) => {
		console.error('Redis client error', err)
	})

	try {
		if (!client.isOpen) {
			await client.connect()
		}

		global.__redisClient = client
		return client
	} catch (error) {
		global.__redisUnavailable = true
		console.error('Redis unavailable, falling back to in-memory storage', error)
		try {
			client.destroy()
		} catch {}
		return getMemoryClient()
	}
}
