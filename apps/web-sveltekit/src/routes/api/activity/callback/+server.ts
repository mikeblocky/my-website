import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRedisClient } from '$lib/kv/client';
import { getRedirectUri } from '$lib/spotify/spotify';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
	const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
	const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;

	if (!CLIENT_ID || !CLIENT_SECRET) {
		return new Response(JSON.stringify({ error: 'Spotify credentials not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');
	const origin = url.origin;

	if (error) {
		console.error('Spotify OAuth error in callback:', error);
		throw redirect(307, `${origin}/journal?spotify=error&details=${error}`);
	}

	if (!code) {
		throw redirect(307, `${origin}/journal?spotify=error&details=missing_code`);
	}

	const redirectUri = getRedirectUri(origin);
	const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

	try {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${basic}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Failed to exchange Spotify auth code:', errorText);
			throw redirect(307, `${origin}/journal?spotify=error&details=token_exchange_failed`);
		}

		const data = await response.json();
		const redis = await getRedisClient();

		const expiresAt = Date.now() + data.expires_in * 1000;

		await redis.set('spotify:access_token', data.access_token);
		await redis.set('spotify:expires_at', expiresAt.toString());
		
		if (data.refresh_token) {
			await redis.set('spotify:refresh_token', data.refresh_token);
		}

		throw redirect(307, `${origin}/journal?spotify=success`);
	} catch (err) {
		// If it's a SvelteKit redirect, rethrow it directly
		if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
			throw err;
		}
		console.error('Exception in Spotify callback route:', err);
		throw redirect(307, `${origin}/journal?spotify=error&details=exception`);
	}
};
