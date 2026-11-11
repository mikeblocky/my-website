import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getRedisClient } from '$lib/kv/client';
import type { Commission } from '$lib/commissions';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { cloudBindings } from './cloudflare';

const key = 'private:commissions:v1';
const directory = path.resolve('.dev-data');
const file = path.join(directory, 'commissions.json');
let queue: Promise<unknown> = Promise.resolve();
async function readLocal(): Promise<Commission[]> {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
}
async function redis() {
  if (!env.REDIS_URL) throw new Error('Persistent storage is not configured. No changes were saved.');
  await getRedisClient();
  if (!global.__redisClient?.isOpen || global.__redisUnavailable) throw new Error('Storage is unavailable. No changes were saved.');
  return global.__redisClient;
}
export async function listCommissions(): Promise<Commission[]> {
  const cloud = cloudBindings();
  if (cloud?.DB) return (await cloud.DB.prepare('SELECT value FROM redis_hashes WHERE key=?').bind(key).all<{value:string}>()).results.map(row=>JSON.parse(row.value));
  if (dev) { await queue; return readLocal(); }
  return (await (await redis()).hVals(key)).map(value => JSON.parse(value));
}
export async function saveCommission(entry: Commission, revision: string) {
  const cloud = cloudBindings();
  if (cloud?.DB) {
    const result = revision
      ? await cloud.DB.prepare(`UPDATE redis_hashes SET value=? WHERE key=? AND field=? AND json_extract(value,'$.revision')=?`).bind(JSON.stringify(entry),key,entry.id,revision).run()
      : await cloud.DB.prepare('INSERT OR IGNORE INTO redis_hashes(key,field,value) VALUES(?,?,?)').bind(key,entry.id,JSON.stringify(entry)).run();
    if (!result.meta.changes) throw new Error('This order changed in another tab. Refresh before saving.');
    return;
  }
  if (dev) {
    const work = queue.catch(() => {}).then(async () => {
      const entries = await readLocal();
      const old = entries.find(item => item.id === entry.id);
      if ((old?.revision || '') !== revision) throw new Error('This order changed in another tab. Refresh before saving.');
      await mkdir(directory, { recursive: true });
      const temporary = `${file}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify([entry, ...entries.filter(item => item.id !== entry.id)]), { mode: 0o600 });
      await rename(temporary, file);
    });
    queue = work.catch(() => {});
    await work;
    return;
  }
  const result = await (await redis()).eval(`
    local old = redis.call('HGET', KEYS[1], ARGV[1])
    local revision = ''
    if old then revision = cjson.decode(old).revision end
    if revision ~= ARGV[2] then return 0 end
    redis.call('HSET', KEYS[1], ARGV[1], ARGV[3])
    return 1
  `, { keys: [key], arguments: [entry.id, revision, JSON.stringify(entry)] });
  if (result !== 1) throw new Error('This order changed in another tab. Refresh before saving.');
}
