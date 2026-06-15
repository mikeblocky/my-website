import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const appOutput = resolve(root, 'apps/web-sveltekit/.vercel/output');
const rootVercel = resolve(root, '.vercel');
const rootOutput = resolve(rootVercel, 'output');

const npmCommand = process.platform === 'win32' ? process.execPath : 'npm';
const npmArgs =
  process.platform === 'win32'
    ? [
        resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
        '--workspace',
        '@mikeblocky/web-sveltekit',
        'run',
        'build'
      ]
    : ['--workspace', '@mikeblocky/web-sveltekit', 'run', 'build'];

const build = spawnSync(npmCommand, npmArgs, {
  cwd: root,
  stdio: 'inherit'
});

if (build.error) {
  console.error(build.error.message);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync(appOutput)) {
  console.error(`SvelteKit Vercel output was not found at ${appOutput}`);
  process.exit(1);
}

rmSync(rootOutput, { force: true, recursive: true });
mkdirSync(rootVercel, { recursive: true });
cpSync(appOutput, rootOutput, { recursive: true });

console.log(`Copied SvelteKit Vercel output to ${rootOutput}`);
