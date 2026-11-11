import type { RequestHandler } from '@sveltejs/kit'
import { getPromptById } from '$lib/kv/draw'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { socialImageResponse } from '$lib/og/social-response'

export const GET: RequestHandler = async ({ params }) => {
  const prompt = await getPromptById(params.id!)
  if (!prompt) {
    return new Response('Not found', { status: 404 })
  }

  const date = new Date(prompt.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const title = [prompt.character, prompt.media].filter(Boolean).join(' · ')
  const imageUrl = prompt.imageUrls?.[0] || prompt.imageUrl

  const element = boardOgCard({
    colorKey: `draw:${params.id}`,
    imageUrls: prompt.imageUrls,
    accent: '#7c3aed',
    accentSoft: '#f5f3ff',
    border: '#ddd6fe',
    label: 'Drawing prompt',
    title,
    body: prompt.body,
    author: prompt.author || 'anonymous',
    date,
    imageUrl,
  })

  return socialImageResponse(`v4:draw:${params.id}`, element)
}
