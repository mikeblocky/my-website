import type { RequestHandler } from '@sveltejs/kit'
import { getSuggestionById } from '$lib/kv/suggestions'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { socialImageResponse } from '$lib/og/social-response'

export const GET: RequestHandler = async ({ params }) => {
  const suggestion = await getSuggestionById(params.id!)
  if (!suggestion) {
    return new Response('Not found', { status: 404 })
  }

  // Only use note (personal message) or fall back to title — bestPart contains tag metadata
  const body = suggestion.note || suggestion.title
  const showTitle = !!suggestion.note && suggestion.title !== suggestion.note

  const date = new Date(suggestion.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const element = boardOgCard({
    colorKey: `suggestions:${params.id}`,
    imageUrls: suggestion.imageUrls,
    accent: '#0ea5e9',
    accentSoft: '#f0f9ff',
    border: '#bae6fd',
    label: 'Suggestion',
    title: showTitle ? suggestion.title : '',
    body,
    author: suggestion.author || 'anonymous',
    date,
    imageUrl: suggestion.imageUrls?.[0] || suggestion.imageUrl || suggestion.reference?.image,
  })

  return socialImageResponse(`v4:suggestions:${params.id}`, element)
}
