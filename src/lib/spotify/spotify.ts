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
			isPlaying: true
		}
	} catch (error) {
		console.error('Error fetching Spotify currently playing:', error)
		return null
	}
}
