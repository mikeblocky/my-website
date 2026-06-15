import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const appOutput = resolve(root, 'apps/web-sveltekit/.vercel/output');
const rootVercel = resolve(root, '.vercel');
const rootOutput = resolve(rootVercel, 'output');
const appBundlePrefix = 'apps/web-sveltekit/';

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
normalizeFunctionHandlers(resolve(rootOutput, 'functions'));

console.log(`Copied SvelteKit Vercel output to ${rootOutput}`);

function normalizeFunctionHandlers(functionsDir) {
  if (!existsSync(functionsDir)) {
    return;
  }

  for (const configPath of findVcConfigs(functionsDir)) {
    const functionDir = dirname(configPath);
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    if (typeof config.handler !== 'string') {
      continue;
    }

    const normalizedHandler = config.handler.replaceAll('\\', '/');
    const appPathIndex = normalizedHandler.indexOf(appBundlePrefix);

    if (appPathIndex === -1) {
      continue;
    }

    const bundledHandler = resolve(functionDir, normalizedHandler.slice(appPathIndex));

    if (!existsSync(bundledHandler)) {
      console.error(`Bundled Vercel handler was not found at ${bundledHandler}`);
      process.exit(1);
    }

    config.handler = relative(functionDir, bundledHandler).split(sep).join('/');
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  }
}

function findVcConfigs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const configs = [];

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      configs.push(...findVcConfigs(entryPath));
    } else if (entry.name === '.vc-config.json' && statSync(entryPath).isFile()) {
      configs.push(entryPath);
    }
  }

  return configs;
}
