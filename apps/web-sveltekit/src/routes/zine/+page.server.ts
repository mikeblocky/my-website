import { getZines } from '@mikeblocky/site-data/zines';

export const prerender = true;

export function load() {
  return { zines: getZines() };
}
