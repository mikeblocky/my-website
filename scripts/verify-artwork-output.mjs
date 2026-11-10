import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Static assets live outside production function bundles. Keep the filesystem-
// discovered gallery prerendered, and fail deployment rather than publish 0 works.
export function verifyArtworkOutput(outputDirectory) {
  const dataFile = join(outputDirectory, 'static', 'artworks', '__data.json');
  if (!existsSync(dataFile)) {
    throw new Error('Gallery data was not prerendered. /artworks must discover assets at build time.');
  }
  const payload = JSON.parse(readFileSync(dataFile, 'utf8'));
  // SvelteKit serializes page data as a devalue table. Walk its JSON values
  // rather than assuming that serialized node.data is already a plain object.
  const urls = new Set();
  const pending = [payload];
  while (pending.length) {
    const value = pending.pop();
    if (typeof value === 'string' && /^\/artworks\/.+\.(?:png|jpe?g|webp|avif)$/i.test(value)) urls.add(value);
    else if (value && typeof value === 'object') pending.push(...Object.values(value));
  }
  const items = [...urls];
  if (!items.length) throw new Error('Gallery build contains no artworks. Check public/artworks discovery.');
  for (const src of items) {
    const assetPath = join(outputDirectory, 'static', decodeURIComponent(src.slice(1)));
    if (!existsSync(assetPath)) throw new Error(`Gallery asset is missing from deployment: ${src}`);
  }
  console.log(`Verified prerendered gallery: ${items.length} artworks with published image files.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyArtworkOutput(resolve(process.argv[2] || '.vercel/output'));
}
