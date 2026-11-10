import type { RequestHandler } from './$types';
import { pageOgCard } from '$lib/og/PageOgCard';
import { generatePng } from '$lib/og/generate';

export const GET: RequestHandler = async ({ url }) => {
  const title = (url.searchParams.get('title') || 'mikeblocky.com').trim().slice(0, 180);
  const png = await generatePng(pageOgCard(title) as any);
  return new Response(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
};
