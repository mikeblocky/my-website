import { mkdir, writeFile } from 'node:fs/promises';
const directory = new URL('../apps/web-sveltekit/.dev-data/', import.meta.url);
await mkdir(directory, { recursive: true });
const feeds = { talk: 'questions', draw: 'prompts', suggestions: 'suggestions', sketchbook: 'drawings' };
await Promise.all(Object.entries(feeds).map(async ([name, field]) => {
  const response = await fetch(`https://mikeblocky.com/api/${name}`, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload[field])) throw new Error(`Invalid ${name} feed`);
  await writeFile(new URL(`${name}.json`, directory), JSON.stringify({ [field]: payload[field] }));
  console.log(`${name}: imported ${payload[field].length} public posts`);
}));
console.log('Restart the dev server to load the refreshed snapshots. This replaces local feed edits.');
