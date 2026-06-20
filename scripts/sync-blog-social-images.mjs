import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const postsRoot = path.join(root, 'apps', 'web-sveltekit', 'src', 'routes', 'blog', 'posts');
const publicPostsRoot = path.join(root, 'public', 'blog', 'posts');
const socialFilePattern = /^(opengraph-image|twitter-image)\.(png|jpe?g|webp|avif)$/i;

if (!existsSync(postsRoot)) {
  throw new Error(`Blog posts directory does not exist: ${postsRoot}`);
}

mkdirSync(publicPostsRoot, { recursive: true });

let copied = 0;

for (const slug of readdirSync(postsRoot)) {
  const sourceDir = path.join(postsRoot, slug);
  const destinationDir = path.join(publicPostsRoot, slug);
  const socialFiles = readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && socialFilePattern.test(entry.name))
    .map((entry) => entry.name);

  if (socialFiles.length === 0) {
    continue;
  }

  rmSync(destinationDir, { recursive: true, force: true });
  mkdirSync(destinationDir, { recursive: true });

  for (const fileName of socialFiles) {
    copyFileSync(path.join(sourceDir, fileName), path.join(destinationDir, fileName));
    copied += 1;
  }
}

console.log(`Synced ${copied} blog social image file${copied === 1 ? '' : 's'} to public/blog/posts.`);
