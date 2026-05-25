import { NextResponse } from 'next/server'
import { getRedirectUri } from '@/lib/spotify/spotify'

export async function GET(request: Request) {
	const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
	if (!CLIENT_ID) {
		return NextResponse.json({ error: 'Spotify Client ID is not configured' }, { status: 500 })
	}

	const { origin } = new URL(request.url)
	const redirectUri = getRedirectUri(origin)

	const scope = 'user-read-recently-played user-read-currently-playing'
	const state = 'spotify-auth-state'

	const authUrl = new URL('https://accounts.spotify.com/authorize')
	authUrl.searchParams.append('client_id', CLIENT_ID)
	authUrl.searchParams.append('response_type', 'code')
	authUrl.searchParams.append('redirect_uri', redirectUri)
	authUrl.searchParams.append('scope', scope)
	authUrl.searchParams.append('state', state)

	return NextResponse.redirect(authUrl.toString())
}
