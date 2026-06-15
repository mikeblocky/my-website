import path from 'node:path';

export function getPublicAssetRoot() {
  const cwd = process.cwd();

  if (cwd.endsWith(path.join('apps', 'web-sveltekit'))) {
    return path.resolve(cwd, '..', '..', 'public');
  }

  return path.resolve(cwd, 'public');
}
