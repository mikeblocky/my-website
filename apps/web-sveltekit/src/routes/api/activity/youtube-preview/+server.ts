import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
	const song = url.searchParams.get('song');
	const artist = url.searchParams.get('artist');

	if (!song || !artist) {
		return json({ success: false, error: 'Missing song or artist' }, { status: 400 });
	}

	const apiKey = env.YOUTUBE_API_KEY;
	if (!apiKey) {
		return json({ success: false, error: 'YouTube API key not configured' }, { status: 503 });
	}

	try {
		const query = encodeURIComponent(`${song} ${artist} official audio`);
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=1&key=${apiKey}`,
			{ cache: 'no-store' }
		);

		if (!res.ok) {
			return json({ success: false, error: 'YouTube API error' }, { status: 502 });
		}

		const data = await res.json();
		const item = data.items?.[0];
		if (!item) {
			return json({ success: false, videoId: null });
		}

		return json({ success: true, videoId: item.id.videoId, title: item.snippet.title });
	} catch (err) {
		console.error('YouTube preview search error:', err);
		return json({ success: false, error: 'Internal error' }, { status: 500 });
	}
};
