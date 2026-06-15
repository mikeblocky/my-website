import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecentlyPlayed, getCurrentlyPlaying, getAccessToken, recordTrackPlay, getRecordedHistory } from '$lib/spotify/spotify';

// manual entries are currently empty (mirroring Next.js musicActivities)
const musicActivities: any[] = [];

export const GET: RequestHandler = async () => {
	const debugInfo: any = {
		hasToken: false,
		error: null
	};
	try {
		const token = await getAccessToken();
		debugInfo.hasToken = !!token;

		// Fetch data from Spotify
		let currentlyPlaying = null;
		let spotifyRecent: any[] = [];
		let customRecorded: any[] = [];

		if (token) {
			const [currentlyPlayingRes, spotifyRecentRes, customRecordedRes] = await Promise.allSettled([
				getCurrentlyPlaying(token),
				getRecentlyPlayed(30, token),
				getRecordedHistory()
			]);

			if (currentlyPlayingRes.status === 'fulfilled') {
				currentlyPlaying = currentlyPlayingRes.value;
				// If playing and progress metrics exist, record it to custom history in Redis in the background
				if (currentlyPlaying && currentlyPlaying.progressMs && currentlyPlaying.durationMs) {
					recordTrackPlay(currentlyPlaying, currentlyPlaying.progressMs, currentlyPlaying.durationMs)
						.catch(e => console.error('Error recording track play in background:', e));
				}
			} else {
				debugInfo.currentlyPlayingError = currentlyPlayingRes.reason?.message || String(currentlyPlayingRes.reason);
			}

			if (spotifyRecentRes.status === 'fulfilled') {
				spotifyRecent = spotifyRecentRes.value || [];
			} else {
				debugInfo.recentlyPlayedError = spotifyRecentRes.reason?.message || String(spotifyRecentRes.reason);
			}

			if (customRecordedRes.status === 'fulfilled') {
				customRecorded = customRecordedRes.value || [];
			} else {
				debugInfo.customRecordedError = customRecordedRes.reason?.message || String(customRecordedRes.reason);
			}
		}

		// Merge static activities, Spotify recently played, and custom recorded playbacks
		const formattedSpotifyRecent = spotifyRecent.map(activity => ({
			...activity,
			source: 'spotify'
		}));

		const formattedCustom = customRecorded.map(activity => ({
			...activity,
			source: 'spotify'
		}));

		const formattedStatic = musicActivities.map(activity => ({
			...activity,
			source: 'manual'
		}));

		// Merge recently played and custom recorded playbacks, then deduplicate by track name/artist and a time delta < 5 mins
		const mergedSpotify = [...formattedSpotifyRecent, ...formattedCustom];
		const uniqueSpotify: any[] = [];

		mergedSpotify.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		mergedSpotify.forEach(item => {
			const isDuplicate = uniqueSpotify.some(existing => {
				const timeDiff = Math.abs(new Date(existing.timestamp).getTime() - new Date(item.timestamp).getTime());
				return existing.song === item.song && existing.artist === item.artist && timeDiff < 300000; // 5 minutes delta
			});
			if (!isDuplicate) {
				uniqueSpotify.push(item);
			}
		});

		// Combine with manual entries and sort
		const combined = [...uniqueSpotify, ...formattedStatic].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);

		return json({
			success: true,
			currentlyPlaying,
			activities: combined,
			debug: debugInfo
		});
	} catch (err: any) {
		console.error('Error fetching music activities:', err);
		debugInfo.error = err.message || String(err);
		return json({
			success: false,
			error: 'Internal server error',
			debug: debugInfo
		}, { status: 500 });
	}
};
