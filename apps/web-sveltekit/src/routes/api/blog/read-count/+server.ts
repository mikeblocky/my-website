import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blogPosts } from '@mikeblocky/site-data';
import { getRedisClient } from '$lib/kv/client';

function getReadCountKey(slug: string) {
  return `blog:read-count:${slug}`;
}

function isKnownSlug(slug: string) {
  return blogPosts.some((post) => post.slug === slug);
}

export const GET: RequestHandler = async ({ url }) => {
  const slug = url.searchParams.get('slug');

  if (!slug || !isKnownSlug(slug)) {
    return json({ error: 'Invalid blog post slug.' }, { status: 400 });
  }

  const redis = await getRedisClient();
  const count = Number(await redis.get(getReadCountKey(slug)) ?? 0);

  return json({ count });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json().catch(() => null);
  const slug = typeof data?.slug === 'string' ? data.slug : '';

  if (!slug || !isKnownSlug(slug)) {
    return json({ error: 'Invalid blog post slug.' }, { status: 400 });
  }

  const redis = await getRedisClient();
  const count = await redis.incr(getReadCountKey(slug));

  return json({ count });
};
