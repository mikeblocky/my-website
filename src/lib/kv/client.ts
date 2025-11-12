import { createClient, RedisClientType } from 'redis'

export const askQuestionsKey = 'ask:questions'

type RedisClient = RedisClientType<any, any, any>

declare global {
	// eslint-disable-next-line no-var
	var __redisClient: RedisClient | undefined
}

const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
	throw new Error('REDIS_URL is not set. Please add it to your environment variables.')
}

export async function getRedisClient(): Promise<RedisClient> {
	if (global.__redisClient && global.__redisClient.isOpen) {
		return global.__redisClient
	}

	const client = createClient({ url: redisUrl }) as RedisClient
	client.on('error', (err) => {
		console.error('Redis client error', err)
	})

	if (!client.isOpen) {
		await client.connect()
	}

	global.__redisClient = client
	return client
}
