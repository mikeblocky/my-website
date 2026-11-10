import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import sharp from 'sharp';

const publicRoot = resolve(import.meta.dirname, '../public');
const output = join(publicRoot, 'artwork-previews');
mkdirSync(output, { recursive: true });
const manifest = {};
let originalBytes = 0;
let previewBytes = 0;
for (const folder of readdirSync(join(publicRoot, 'artworks'), { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  for (const file of readdirSync(join(publicRoot, 'artworks', folder.name))) {
    if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue;
    const input = readFileSync(join(publicRoot, 'artworks', folder.name, file));
    // Include encoding settings in the hash so future changes also invalidate caches.
    const hash = createHash('sha256').update('webp-v1-640-1600-q82').update(input).digest('hex').slice(0, 20);
    const variants = {};
    for (const [name, size] of [['previewSrc', 640], ['viewerSrc', 1600]]) {
      const filename = `${hash}-${size}.webp`;
      const destination = join(output, filename);
      if (!existsSync(destination)) {
        await sharp(input).rotate().resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(destination);
      }
      variants[name] = `/artwork-previews/${filename}`;
      if (name === 'previewSrc') previewBytes += statSync(destination).size;
    }
    originalBytes += input.length;
    manifest[`/artworks/${folder.name}/${encodeURIComponent(file)}`] = variants;
  }
}
writeFileSync(join(output, 'manifest.json'), JSON.stringify(manifest));
console.log(`Artwork previews: ${Object.keys(manifest).length} works; cards ${(previewBytes / 1e6).toFixed(1)} MB versus ${(originalBytes / 1e6).toFixed(1)} MB originals.`);
