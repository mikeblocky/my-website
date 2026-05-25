import { NextResponse } from 'next/server'
import { musicActivities } from '@/app/journal/_data/activity'
import { getRecentlyPlayed, getCurrentlyPlaying, getAccessToken } from '@/lib/spotify/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
	const debugInfo: any = {
		hasToken: false,
		error: null
	}
	try {
		const token = await getAccessToken()
		debugInfo.hasToken = !!token

		// Fetch data from Spotify
		let currentlyPlaying = null
		let spotifyRecent: any[] = []

		if (token) {
			try {
				currentlyPlaying = await getCurrentlyPlaying()
			} catch (e: any) {
				debugInfo.currentlyPlayingError = e.message || String(e)
			}
			try {
				spotifyRecent = await getRecentlyPlayed(30)
			} catch (e: any) {
				debugInfo.recentlyPlayedError = e.message || String(e)
			}
		}

		// Merge static activities and Spotify activities
		const formattedSpotifyRecent = spotifyRecent.map(activity => ({
			...activity,
			source: 'spotify'
		}))

		const formattedStatic = musicActivities.map(activity => ({
			...activity,
			source: 'manual'
		}))

		// Merge and sort by timestamp descending
		const combined = [...formattedSpotifyRecent, ...formattedStatic].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		)

		return NextResponse.json({
			success: true,
			currentlyPlaying,
			activities: combined,
			debug: debugInfo
		})
	} catch (err: any) {
		console.error('Error fetching music activities:', err)
		debugInfo.error = err.message || String(err)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			debug: debugInfo
		}, { status: 500 })
	}
}
