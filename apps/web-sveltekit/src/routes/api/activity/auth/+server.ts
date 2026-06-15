import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRedirectUri } from '$lib/spotify/spotify';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
	const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
	if (!CLIENT_ID) {
		return new Response(JSON.stringify({ error: 'Spotify Client ID is not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { origin } = url;
	const redirectUri = getRedirectUri(origin);

	const scope = 'user-read-recently-played user-read-currently-playing';
	const state = 'spotify-auth-state';

	const authUrl = new URL('https://accounts.spotify.com/authorize');
	authUrl.searchParams.append('client_id', CLIENT_ID);
	authUrl.searchParams.append('response_type', 'code');
	authUrl.searchParams.append('redirect_uri', redirectUri);
	authUrl.searchParams.append('scope', scope);
	authUrl.searchParams.append('state', state);

	throw redirect(307, authUrl.toString());
};
