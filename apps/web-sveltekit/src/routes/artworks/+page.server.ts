import { getArtworkSections, getDrawingStats } from '@mikeblocky/site-data/artworks';

export const prerender = false;

export function load() {
  // Shuffle on the server so SSR, hydration and the full-screen viewer share one order.
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
