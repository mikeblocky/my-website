export const feedKinds = ['talk', 'draw', 'suggestions', 'sketchbook'] as const;
export type FeedKind = typeof feedKinds[number];
export const feedConfig = {
  talk: { label: 'Post', list: 'questions', item: 'question', prefix: 'talk' },
  draw: { label: 'Drawing prompt', list: 'prompts', item: 'prompt', prefix: 'prompt' },
  suggestions: { label: 'Recommendation', list: 'suggestions', item: 'suggestion', prefix: 'suggestion' },
  sketchbook: { label: 'Drawing', list: 'drawings', item: 'drawing', prefix: 'drawing' }
} as const;
export type FeedPost = { id: string; createdAt: string; [field: string]: any };
export type FeedEntry = { key: string; kind: FeedKind; post: FeedPost };
export type FeedSources = Record<FeedKind, FeedPost[]>;

export function combineFeed(sources: FeedSources): FeedEntry[] {
  return feedKinds.flatMap(kind => sources[kind].map(post => ({ key: `${kind}:${post.id}`, kind, post })))
    .sort((a, b) => (Date.parse(b.post.createdAt) || 0) - (Date.parse(a.post.createdAt) || 0) || a.key.localeCompare(b.key));
}

export function cooldownDeadline(cooldown: { expiresAt?: string | null; remainingMs?: number } | undefined, now = Date.now()) {
  if (!cooldown) return 0;
  if (!cooldown.expiresAt && !(cooldown.remainingMs && cooldown.remainingMs > 0)) return 0;
  return Math.max(0, Date.parse(cooldown.expiresAt || '') || (now + Math.max(0, cooldown.remainingMs || 0)));
}

export function linkedFeedKey(hash: string) {
  const match = feedKinds.find(kind => hash.startsWith(`#${feedConfig[kind].prefix}-`));
  return match ? `${match}:${hash.slice(feedConfig[match].prefix.length + 2)}` : null;
}
