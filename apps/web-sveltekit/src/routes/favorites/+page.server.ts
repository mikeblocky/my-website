import { recommendationGroups } from '@mikeblocky/site-data/favorites';

export const prerender = true;

export function load() {
  return { recommendationGroups };
}
