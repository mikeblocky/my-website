import { getArtworkSections, getDrawingStats } from '@mikeblocky/site-data/artworks';

export const prerender = true;

export function load() {
  return { sections: getArtworkSections(), stats: getDrawingStats() };
}
