import { getArtworkSections, getDrawingStats } from '@mikeblocky/site-data/artworks';

// Artwork discovery reads the source public/ directory. Generate this route at
// build time: production functions serve static assets separately and cannot
// enumerate that directory at request time.
export const prerender = true;

export function load() {
  // Shuffle at build time so the page and viewer share the same serialized order.
  const sections = getArtworkSections().map(section => {
    const items = [...section.items];
    for (let index = items.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [items[index], items[other]] = [items[other], items[index]];
    }
    return { ...section, items };
  });
  return { sections, stats: getDrawingStats() };
}
