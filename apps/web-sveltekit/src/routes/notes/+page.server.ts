import { notes } from '@mikeblocky/site-data/notes';

export const prerender = true;

export function load() {
  return { notes };
}
