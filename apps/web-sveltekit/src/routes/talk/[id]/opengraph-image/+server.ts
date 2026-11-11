import type { RequestHandler } from '@sveltejs/kit'
import { getTalkById } from '$lib/kv/talk'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { socialImageResponse } from '$lib/og/social-response'

export const GET: RequestHandler = async ({ params }) => {
  const talk = await getTalkById(params.id!)
  if (!talk) {
    return new Response('Not found', { status: 404 })
  }

  const date = new Date(talk.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const element = boardOgCard({
    colorKey: `talk:${params.id}`,
    imageUrls: talk.imageUrls,
    accent: '#4f46e5',
    accentSoft: '#eef2ff',
    border: '#c7d2fe',
    label: 'Talk',
    body: talk.body,
    author: talk.author || 'anonymous',
    date,
    imageUrl: talk.imageUrls?.[0] || talk.imageUrl,
  })

  return socialImageResponse(`v4:talk:${params.id}`, element)
}
