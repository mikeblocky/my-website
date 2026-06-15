import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentlyPlaying, getAccessToken, recordTrackPlay } from '$lib/spotify/spotify';

export const GET: RequestHandler = async () => {
	try {
		const token = await getAccessToken();
		if (!token) {
			return json({ success: true, currentlyPlaying: null });
		}

		const currentlyPlaying = await getCurrentlyPlaying(token);
		
		// If playing and progress metrics exist, record it to custom history in Redis
		if (currentlyPlaying && currentlyPlaying.progressMs && currentlyPlaying.durationMs) {
			try {
				await recordTrackPlay(currentlyPlaying, currentlyPlaying.progressMs, currentlyPlaying.durationMs);
			} catch (e) {
				console.error('Error recording track play in Redis:', e);
			}
		}

		return json({
			success: true,
			currentlyPlaying
		});
	} catch (err: any) {
		console.error('Error fetching currently playing track:', err);
		return json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 });
	}
};
