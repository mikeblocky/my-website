import type { RequestHandler } from '@sveltejs/kit'
import { getPromptById } from '$lib/kv/draw'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { generatePng } from '$lib/og/generate'

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

  const png = await generatePng(element as any)
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
