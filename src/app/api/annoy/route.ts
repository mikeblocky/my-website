import { NextRequest, NextResponse } from 'next/server'
import { getRedisClient, lastPetGiftKey } from '@/lib/kv/client'

export async function GET() {
  try {
    const redis = await getRedisClient()
    const lastGif = await redis.get(lastPetGiftKey)
    return NextResponse.json({ gif: lastGif })
  } catch (err) {
    return NextResponse.json({ gif: null })
  }
}

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    // Randomly choose between cat and dog
    const isCat = Math.random() > 0.5
    const apiUrl = isCat 
      ? 'https://api.thecatapi.com/v1/images/search?mime_types=gif' 
      : 'https://api.thedogapi.com/v1/images/search?mime_types=gif'
    
    const res = await fetch(apiUrl)
    const data = await res.json()
    const gifUrl = data[0]?.url

    if (!gifUrl) {
      throw new Error('Failed to fetch GIF from source')
    }

    // Save to KV
    const redis = await getRedisClient()
    await redis.set(lastPetGiftKey, gifUrl)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pet Messenger 🐾',
        content: `A small gift has been sent: ${gifUrl}`,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to send to Discord' }, { status: 500 })
    }

    return NextResponse.json({ success: true, gif: gifUrl })
  } catch (err) {
    console.error('Error in annoy route:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
