import { getArtworkSections } from '@mikeblocky/site-data/artworks';
import { blogPosts } from '@mikeblocky/site-data';

export const prerender = true;

export function load() {
  const sections = getArtworkSections();
  // Interleave the collections, then cycle through every published work.
  const artworks: { src: string; label: string; width: number; height: number }[] = [];
  const longest = Math.max(0, ...sections.map(section => section.items.length));
  for (let index = 0; index < longest; index++) {
    for (const section of sections) {
      const item = section.items[index];
      if (item) artworks.push({ src: item.previewSrc ?? item.src, label: section.title, width: item.width, height: item.height });
    }
  }
  return {
    artworks,
    artworkCount: sections.reduce((count, section) => count + section.items.length, 0),
    recentPosts: [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)
  };
}
