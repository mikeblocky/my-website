import { friendGroups } from '@mikeblocky/site-data/friends';

export const prerender = true;

export function load() {
  return { friendGroups };
}
