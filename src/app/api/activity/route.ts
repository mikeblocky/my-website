import { NextResponse } from 'next/server'
import { musicActivities } from '@/app/journal/_data/activity'
import { getRecentlyPlayed, getCurrentlyPlaying, getAccessToken, recordTrackPlay, getRecordedHistory } from '@/lib/spotify/spotify'

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
		let customRecorded: any[] = []

		if (token) {
			try {
				currentlyPlaying = await getCurrentlyPlaying()
				// If playing and progress metrics exist, record it to custom history in Redis
				if (currentlyPlaying && currentlyPlaying.progressMs && currentlyPlaying.durationMs) {
					await recordTrackPlay(currentlyPlaying, currentlyPlaying.progressMs, currentlyPlaying.durationMs)
				}
			} catch (e: any) {
				debugInfo.currentlyPlayingError = e.message || String(e)
			}
			try {
				spotifyRecent = await getRecentlyPlayed(30)
			} catch (e: any) {
				debugInfo.recentlyPlayedError = e.message || String(e)
			}
			try {
				customRecorded = await getRecordedHistory()
			} catch (e: any) {
				debugInfo.customRecordedError = e.message || String(e)
			}
		}

		// Merge static activities, Spotify recently played, and custom recorded playbacks
		const formattedSpotifyRecent = spotifyRecent.map(activity => ({
			...activity,
			source: 'spotify'
		}))

		const formattedCustom = customRecorded.map(activity => ({
			...activity,
			source: 'spotify'
		}))

		const formattedStatic = musicActivities.map(activity => ({
			...activity,
			source: 'manual'
		}))

		// Merge recently played and custom recorded playbacks, then deduplicate by track name/artist and a time delta < 5 mins
		const mergedSpotify = [...formattedSpotifyRecent, ...formattedCustom]
		const uniqueSpotify: any[] = []

		mergedSpotify.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

		mergedSpotify.forEach(item => {
			const isDuplicate = uniqueSpotify.some(existing => {
				const timeDiff = Math.abs(new Date(existing.timestamp).getTime() - new Date(item.timestamp).getTime())
				return existing.song === item.song && existing.artist === item.artist && timeDiff < 300000 // 5 minutes delta
			})
			if (!isDuplicate) {
				uniqueSpotify.push(item)
			}
		})

		// Combine with manual entries and sort
		const combined = [...uniqueSpotify, ...formattedStatic].sort(
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
