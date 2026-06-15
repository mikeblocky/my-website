import { getArtworkItems } from '@mikeblocky/site-data/artworks';
export const prerender = true;
export function load() {
  return { items: getArtworkItems('kemutai-hanashi') };
}
