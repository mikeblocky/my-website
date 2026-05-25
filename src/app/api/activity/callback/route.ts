import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/kv/client'
import { getRedirectUri } from '@/lib/spotify/spotify'

export async function GET(request: Request) {
	const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
	const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

	if (!CLIENT_ID || !CLIENT_SECRET) {
		return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 })
	}

	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get('code')
	const error = searchParams.get('error')

	if (error) {
		console.error('Spotify OAuth error in callback:', error)
		return NextResponse.redirect(`${origin}/journal?spotify=error&details=${error}`)
	}

	if (!code) {
		return NextResponse.redirect(`${origin}/journal?spotify=error&details=missing_code`)
	}

	const redirectUri = getRedirectUri(origin)
	const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

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
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Failed to exchange Spotify auth code:', errorText)
			return NextResponse.redirect(`${origin}/journal?spotify=error&details=token_exchange_failed`)
		}

		const data = await response.json()
		const redis = await getRedisClient()

		const expiresAt = Date.now() + data.expires_in * 1000

		await redis.set('spotify:access_token', data.access_token)
		await redis.set('spotify:expires_at', expiresAt.toString())
		
		if (data.refresh_token) {
			await redis.set('spotify:refresh_token', data.refresh_token)
		}

		return NextResponse.redirect(`${origin}/journal?spotify=success`)
	} catch (err) {
		console.error('Exception in Spotify callback route:', err)
		return NextResponse.redirect(`${origin}/journal?spotify=error&details=exception`)
	}
}
