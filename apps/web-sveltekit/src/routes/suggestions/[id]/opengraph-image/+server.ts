import type { RequestHandler } from '@sveltejs/kit'
import { getSuggestionById } from '$lib/kv/suggestions'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { generatePng } from '$lib/og/generate'

export const GET: RequestHandler = async ({ params }) => {
  const suggestion = await getSuggestionById(params.id!)
  if (!suggestion) {
    return new Response('Not found', { status: 404 })
  }

  const body = suggestion.note || suggestion.bestPart || suggestion.title
  const showTitle = suggestion.title && body !== suggestion.title
  const date = new Date(suggestion.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const element = boardOgCard({
    accent: '#0ea5e9',
    accentSoft: '#f0f9ff',
    border: '#bae6fd',
    footer: 'mikeblocky.com/interact',
    label: 'Suggestion',
    title: showTitle ? suggestion.title : '',
    body,
    date,
    imageUrl: suggestion.imageUrl,
  })

  const png = await generatePng(element as any)
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
