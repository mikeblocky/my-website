import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import { getPublicAssetRoot } from './asset-root';

export type ArtworkItem = {
  src: string;
  isPortrait: boolean;
  width: number;
  height: number;
};

export type ArtworkSection = {
  title: string;
  folder: string;
  items: ArtworkItem[];
};

export type DrawingStat = {
  label: string;
  value: number;
  color: string;
};

export const artworkSectionsConfig = [
  { title: 'Kemutai Hanashi', folder: 'kemutai-hanashi' },
  { title: 'Skip and Loafer', folder: 'skip-and-loafer' }
];

const drawingStatCategories = [
  { label: 'Kemutai Hanashi', folder: 'kemutai-hanashi', color: 'orange' },
  { label: 'Skip and Loafer', folder: 'skip-and-loafer', color: 'blue' },
  { label: 'Hoshiai no Sora', folder: 'hoshiai-no-sora', color: 'green' },
  { label: 'Fan-art for Mutuals', folder: 'mutuals', color: 'pink' },
  { label: 'Animations', folder: 'animations', color: 'yellow' },
  { label: 'Kimi ni wa Todokanai', folder: 'kiminai', color: 'purple' }
];

export function getArtworkItems(folder: string): ArtworkItem[] {
  const folderPath = path.join(getPublicAssetRoot(), 'artworks', folder);

  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const items = fs
    .readdirSync(folderPath)
    .filter((fileName) => /\.(png|jpe?g|webp|avif)$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }))
    .map((fileName) => {
      const absolutePath = path.join(folderPath, fileName);
      const dimensions = imageSize(fs.readFileSync(absolutePath));
      const width = dimensions.width ?? 800;
      const height = dimensions.height ?? 1000;

      return {
        src: `/artworks/${folder}/${encodeURIComponent(fileName)}`,
        isPortrait: height > width,
        width,
        height
      };
    });

  return [
    ...items.filter((item) => item.isPortrait),
    ...items.filter((item) => !item.isPortrait)
  ];
}

export function getArtworkSections(): ArtworkSection[] {
  return artworkSectionsConfig.map((section) => ({
    ...section,
    items: getArtworkItems(section.folder)
  }));
}

export function getDrawingStats(): DrawingStat[] {
  const distributionDir = path.join(getPublicAssetRoot(), 'distribution');
  const counts: Record<string, number> = {};

  drawingStatCategories.forEach((category) => {
    counts[category.label] = 0;
  });

  const scan = (dir: string, currentCategoryLabel: string | null) => {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const category = drawingStatCategories.find((item) => item.folder === entry.name);
        scan(fullPath, category ? category.label : currentCategoryLabel);
      } else if (/\.(png|jpe?g|webp|avif|gif|mp4|mov)$/i.test(entry.name)) {
        if (/\.(mp4|gif|mov)$/i.test(entry.name)) {
          counts.Animations += 1;
        } else if (currentCategoryLabel) {
          counts[currentCategoryLabel] += 1;
        }
      }
    }
  };

  scan(distributionDir, null);

  return drawingStatCategories
    .map((category) => ({
      label: category.label,
      value: counts[category.label],
      color: category.color
    }))
    .sort((a, b) => b.value - a.value);
}
