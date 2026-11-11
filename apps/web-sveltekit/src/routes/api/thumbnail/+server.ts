import type { RequestHandler } from './$types';
import { pageOgCard } from '$lib/og/PageOgCard';
import { socialImageResponse } from '$lib/og/social-response';

export const GET: RequestHandler = async ({ url }) => {
  const title = (url.searchParams.get('title') || 'mikeblocky.com').trim().slice(0, 512);
  return socialImageResponse(`page:${title}`,pageOgCard(title));
};
