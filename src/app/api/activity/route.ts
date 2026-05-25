import { NextResponse } from 'next/server'
import { musicActivities } from '@/app/journal/_data/activity'
import { getRecentlyPlayed, getCurrentlyPlaying } from '@/lib/spotify/spotify'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		// Fetch data from Spotify
		const currentlyPlaying = await getCurrentlyPlaying()
		const spotifyRecent = await getRecentlyPlayed(30)

		// Merge static activities and Spotify activities
		// We'll mark the source so the UI can optionally display it
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
			activities: combined
		})
	} catch (err) {
		console.error('Error fetching music activities:', err)
		return NextResponse.json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 })
	}
}
