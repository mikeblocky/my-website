import type { RequestHandler } from '@sveltejs/kit'
import { getDrawingById } from '$lib/kv/sketchbook'
import { artworkOgCard } from '$lib/og/ArtworkOgCard'
import { socialImageResponse } from '$lib/og/social-response'

export const GET: RequestHandler = async ({ params }) => {
  const drawing = await getDrawingById(params.id!)
  if (!drawing) {
    return new Response('Not found', { status: 404 })
  }

  if (!drawing.imageUrl) {
    return new Response('No image', { status: 404 })
  }

  const date = new Date(drawing.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const element = artworkOgCard({
    imageUrl: drawing.imageUrl,
    caption: drawing.body || undefined,
    author: drawing.author,
    date,
  })

  return socialImageResponse(`sketchbook:${params.id}`, element)
}
