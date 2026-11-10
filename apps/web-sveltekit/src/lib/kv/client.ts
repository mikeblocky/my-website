import { createClient } from 'redis'
import type { RedisClientType } from 'redis'
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const askQuestionsKey = 'ask:questions'
export const talkMessagesKey = 'talk:messages'
export const drawPromptsKey = 'draw:prompts'
export const suggestionsKey = 'suggestions:media'
export const sketchbookDrawingsKey = 'sketchbook:drawings'
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
	setIfNotExists: (key: string, value: string) => Promise<boolean>
	get: (key: string) => Promise<string | null>
	incr: (key: string) => Promise<number>
}

declare global {
	var __redisClient: RedisClient | undefined
	var __memorySortedSets: Map<string, Array<{ score: number; value: string }>> | undefined
	var __memoryStrings: Map<string, string> | undefined
	var __redisUnavailable: boolean | undefined
}

const redisUrl = env.REDIS_URL

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
		async setIfNotExists(key, value) {
			if (global.__memoryStrings?.has(key)) {
				return false
			}
			global.__memoryStrings?.set(key, value)
			return true
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

// Public production snapshots are loaded only into local development memory.
// Every edit remains local, and is persisted across dev-server restarts.
const devDirectory = path.resolve('.dev-data');
const devFeeds = [
  ['talk', 'questions', talkMessagesKey], ['draw', 'prompts', drawPromptsKey],
  ['suggestions', 'suggestions', suggestionsKey], ['sketchbook', 'drawings', sketchbookDrawingsKey]
] as const;
let persistQueue = Promise.resolve();
let devContentLoaded: Promise<void> | undefined;
async function loadDevContent() {
  const memory = getMemoryClient();
  await Promise.all(devFeeds.map(async ([name, field, key]) => {
    try {
      const payload = JSON.parse(await readFile(path.join(devDirectory, `${name}.json`), 'utf8'));
      const posts = payload[field];
      if (!Array.isArray(posts)) throw new Error('Invalid snapshot');
      const existingIds = new Set((await memory.zRange(key, 0, -1)).map(value => JSON.parse(value).id));
      await memory.zAdd(key, posts.filter(post => post && typeof post.id === 'string' && !existingIds.has(post.id)).map(post => ({
        score: Date.parse(post.createdAt) || 0, value: JSON.stringify(post)
      })));
    } catch (error) { console.warn(`Dev ${name}: no saved public snapshot. Run npm run sync:interact.`, error instanceof Error ? error.message : ''); }
  }));
}
function devClient(): KvClient {
  const memory = getMemoryClient();
  const persist = () => {
    persistQueue = persistQueue.catch(() => {}).then(async () => {
      await mkdir(devDirectory, { recursive: true });
      await Promise.all(devFeeds.map(async ([name, field, key]) => {
        const posts = (await memory.zRange(key, 0, -1)).map(value => JSON.parse(value));
        await writeFile(path.join(devDirectory, `${name}.json`), JSON.stringify({ [field]: posts }));
      }));
    });
    return persistQueue;
  };
  return { ...memory,
    async zAdd(key, members) { const result = await memory.zAdd(key, members); await persist(); return result; },
    async zRem(key, member) { const result = await memory.zRem(key, member); await persist(); return result; },
    async zRemRangeByRank(key, start, stop) { const result = await memory.zRemRangeByRank(key, start, stop); await persist(); return result; }
  };
}

export async function getRedisClient(): Promise<KvClient> {
  if (dev && !redisUrl) {
    devContentLoaded ??= loadDevContent();
    await devContentLoaded;
    return devClient();
  }
	if (!redisUrl || global.__redisUnavailable) {
		return getMemoryClient()
	}

	if (global.__redisClient && global.__redisClient.isOpen) {
		const client = global.__redisClient as any
		if (!client.setIfNotExists) {
			client.setIfNotExists = async (key: string, value: string) => {
				const result = await client.set(key, value, { NX: true })
				return result === 'OK'
			}
		}
		return client
	}

	const client = createClient({ url: redisUrl }) as RedisClient
	client.on('error', (err) => {
		console.error('Redis client error', err)
	})

	try {
		if (!client.isOpen) {
			await client.connect()
		}

		const kvClient = client as any
		kvClient.setIfNotExists = async (key: string, value: string) => {
			const result = await kvClient.set(key, value, { NX: true })
			return result === 'OK'
		}

		global.__redisClient = client
		return kvClient
	} catch (error) {
		global.__redisUnavailable = true
		console.error('Redis unavailable, falling back to in-memory storage', error)
		try {
			client.destroy()
		} catch {}
		return getMemoryClient()
	}
}
