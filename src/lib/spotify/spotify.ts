import { getRedisClient } from '@/lib/kv/client'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

export interface SpotifyTrack {
	id: string
	song: string
	artist: string
	album: string
	artworkUrl: string
	platform: 'spotify'
	songUrl: string
	timestamp: string // ISO string
	isPlaying?: boolean
	progressMs?: number
	durationMs?: number
}

export function getRedirectUri(origin: string) {
	if (process.env.SPOTIFY_REDIRECT_URI) {
		return process.env.SPOTIFY_REDIRECT_URI
	}
	if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
		// Default to localhost callback if local, but can fallback to production if they don't have it set up
		return `${origin}/api/activity/callback`
	}
	return 'https://www.mikeblocky.com/api/activity/callback'
}

export async function getAccessToken(): Promise<string | null> {
	const redis = await getRedisClient()
	const accessToken = await redis.get('spotify:access_token')
	const refreshToken = await redis.get('spotify:refresh_token')
	const expiresAtStr = await redis.get('spotify:expires_at')

	if (!accessToken || !refreshToken) {
		return null
	}

	const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0
	const now = Date.now()

	// If token expires in less than 5 minutes (300,000 ms), refresh it
	if (now >= expiresAt - 300000) {
		const refreshed = await refreshAccessToken(refreshToken)
		if (refreshed) {
			return refreshed.accessToken
		}
		return null
	}

	return accessToken
}

async function refreshAccessToken(refreshToken: string) {
	if (!CLIENT_ID || !CLIENT_SECRET) {
		console.error('Spotify Client ID or Secret is not configured')
		return null
	}

	const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

	try {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${basic}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			})
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Failed to refresh Spotify token:', errorText)
			return null
		}

		const data = await response.json()
		const redis = await getRedisClient()

		const nextAccessToken = data.access_token
		const nextExpiresAt = Date.now() + data.expires_in * 1000

		await redis.set('spotify:access_token', nextAccessToken)
		await redis.set('spotify:expires_at', nextExpiresAt.toString())

		if (data.refresh_token) {
			await redis.set('spotify:refresh_token', data.refresh_token)
		}

		return {
			accessToken: nextAccessToken,
			refreshToken: data.refresh_token || refreshToken,
			expiresAt: nextExpiresAt
		}
	} catch (error) {
		console.error('Error in refreshAccessToken:', error)
		return null
	}
}

export async function getRecentlyPlayed(limit = 20): Promise<SpotifyTrack[]> {
	const accessToken = await getAccessToken()
	if (!accessToken) {
		return []
	}

	try {
		const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			next: { revalidate: 60 } // cache for 1 minute
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Spotify recently played error:', errorText)
			return []
		}

		const data = await response.json()
		if (!data.items) {
			return []
		}

		return data.items.map((item: any) => {
			const track = item.track
			const artworkUrl = track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop'
			const artists = track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'

			return {
				id: `spotify-${track.id}-${new Date(item.played_at).getTime()}`,
				song: track.name,
				artist: artists,
				album: track.album?.name || 'Unknown Album',
				artworkUrl,
				platform: 'spotify',
				songUrl: track.external_urls?.spotify || '',
				timestamp: item.played_at
			}
		})
	} catch (error) {
		console.error('Error fetching Spotify recently played:', error)
		return []
	}
}

export async function getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
	const accessToken = await getAccessToken()
	if (!accessToken) {
		return null
	}

	try {
		const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			next: { revalidate: 0 } // do not cache currently playing
		})

		if (response.status === 204 || response.status > 400) {
			return null
		}

		const data = await response.json()
		if (!data || !data.is_playing || !data.item) {
			return null
		}

		const track = data.item
		const artworkUrl = track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop'
		const artists = track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'

		return {
			id: `spotify-current-${track.id}`,
			song: track.name,
			artist: artists,
			album: track.album?.name || 'Unknown Album',
			artworkUrl,
			platform: 'spotify',
			songUrl: track.external_urls?.spotify || '',
			timestamp: new Date().toISOString(),
			isPlaying: true,
			progressMs: data.progress_ms,
			durationMs: track.duration_ms
		}
	} catch (error) {
		console.error('Error fetching Spotify currently playing:', error)
		return null
	}
}

export async function recordTrackPlay(track: SpotifyTrack, progressMs: number, durationMs: number) {
	if (!progressMs || !durationMs) return

	const progressPercent = progressMs / durationMs
	// Threshold: min 30% of the song (in the 20% - 40% range requested by the user)
	if (progressPercent < 0.3) {
		return
	}

	try {
		const redis = await getRedisClient()
		
		// Calculate play starting time to deduplicate Pauses/Resumes
		const startTime = Date.now() - progressMs
		// Bounded to 30 seconds interval
		const roundTime = Math.floor(startTime / 30000) * 30000
		const dedupeKey = `spotify:play:${track.id}:${roundTime}`

		// Try to claim this play event
		const isNewPlay = await redis.setIfNotExists(dedupeKey, '1')
		if (isNewPlay) {
			console.log(`[Spotify History] Recording new play for: ${track.song}`)
			
			const historyItem = {
				id: `spotify-recorded-${track.id}-${Date.now()}`,
				song: track.song,
				artist: track.artist,
				album: track.album,
				artworkUrl: track.artworkUrl,
				platform: 'spotify',
				songUrl: track.songUrl,
				timestamp: new Date().toISOString()
			}

			// Add to sorted set
			await redis.zAdd('spotify:history', [{
				score: Date.now(),
				value: JSON.stringify(historyItem)
			}])

			// Keep only the last 50 items in the sorted set
			const count = await redis.zCard('spotify:history')
			if (count > 50) {
				await redis.zRemRangeByRank('spotify:history', 0, count - 51)
			}
		}
	} catch (error) {
		console.error('Error recording track play in Redis:', error)
	}
}

export async function getRecordedHistory(): Promise<SpotifyTrack[]> {
	try {
		const redis = await getRedisClient()
		const rawItems = await redis.zRange('spotify:history', 0, -1, { REV: true })
		return rawItems.map((raw: string) => JSON.parse(raw))
	} catch (error) {
		console.error('Error fetching recorded history:', error)
		return []
	}
}
