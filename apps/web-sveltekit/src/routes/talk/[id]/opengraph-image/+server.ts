import type { RequestHandler } from '@sveltejs/kit'
import { getTalkById } from '$lib/kv/talk'
import { boardOgCard } from '$lib/og/BoardOgCard'
import { generatePng } from '$lib/og/generate'

export const GET: RequestHandler = async ({ params }) => {
  const talk = await getTalkById(params.id!)
  if (!talk) {
    return new Response('Not found', { status: 404 })
  }

  const date = new Date(talk.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const element = boardOgCard({
    accent: '#4f46e5',
    accentSoft: '#eef2ff',
    border: '#c7d2fe',
    footer: 'mikeblocky.com/interact',
    label: 'Talk',
    title: '',
    body: talk.body,
    date,
    imageUrl: talk.imageUrl,
  })

  const png = await generatePng(element as any)
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
