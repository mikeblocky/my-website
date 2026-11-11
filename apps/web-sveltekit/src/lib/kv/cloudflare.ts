import { createHash } from 'node:crypto';
import type { CloudBindings } from '$lib/server/cloudflare';
import { extractPublicMedia } from './public-media';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function cloudflareClient(cloud: CloudBindings) {
  const { DB, PRIVATE_FILES } = cloud;
  const pack = async (value: string) => {
    if (Buffer.byteLength(value) < 100000) return JSON.stringify({ text: value });
    const key = `records/${hash(value)}`;
    await PRIVATE_FILES.put(key, value);
    return JSON.stringify({ object: key });
  };
  const unpack = async (value: string): Promise<string> => {
    const item = JSON.parse(value);
    if (typeof item.text === 'string') return item.text;
    const object = await PRIVATE_FILES.get(item.object);
    if (!object) throw new Error('Stored content is unavailable.');
    return object.text();
  };
  const client = {
    async get(key: string) { const row = await DB.prepare('SELECT value FROM redis_strings WHERE key=? AND (expires_at IS NULL OR expires_at>?)').bind(key, Date.now()).first<{value:string}>(); return row ? unpack(row.value) : null; },
    async set(key: string, value: string) { await DB.prepare('INSERT INTO redis_strings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires_at=NULL').bind(key, await pack(value)).run(); return 'OK'; },
    async setIfNotExists(key: string, value: string) { await DB.prepare('DELETE FROM redis_strings WHERE key=? AND expires_at<=?').bind(key,Date.now()).run(); const result = await DB.prepare('INSERT OR IGNORE INTO redis_strings(key,value) VALUES(?,?)').bind(key, await pack(value)).run(); return result.meta.changes > 0; },
    async incr(key: string) { const row = await DB.prepare(`INSERT INTO redis_strings(key,value) VALUES(?,json_object('text','1')) ON CONFLICT(key) DO UPDATE SET value=json_object('text',CAST(CAST(json_extract(redis_strings.value,'$.text') AS INTEGER)+1 AS TEXT)) RETURNING value`).bind(key).first<{value:string}>(); return Number(await unpack(row!.value)); },
    async zAdd(key: string, members: {score:number;value:string}[]) { for (const member of members) {const value=['talk:messages','ask:questions','sketchbook:drawings','draw:prompts','suggestions:media'].includes(key)?JSON.stringify(await extractPublicMedia(JSON.parse(member.value),cloud)):member.value;await DB.prepare('INSERT INTO redis_sorted(key,member_hash,value,score) VALUES(?,?,?,?) ON CONFLICT(key,member_hash) DO UPDATE SET score=excluded.score').bind(key,hash(value),await pack(value),member.score).run();}return members.length; },
    async zCard(key: string) { return Number(await DB.prepare('SELECT COUNT(*) AS count FROM redis_sorted WHERE key=?').bind(key).first<number>('count')); },
    async zRange(key: string, start: number, stop: number, options?: {REV?:boolean}) {
      const count = await client.zCard(key), from = start < 0 ? Math.max(0,count+start) : start, to = stop < 0 ? count+stop : stop;
      if (to < from) return [];
      const order = options?.REV ? 'DESC' : 'ASC';
      const rows = await DB.prepare(`SELECT value FROM redis_sorted WHERE key=? ORDER BY score ${order},member_hash ${order} LIMIT ? OFFSET ?`).bind(key,to-from+1,from).all<{value:string}>();
      return Promise.all(rows.results.map(row=>unpack(row.value)));
    },
    async zRem(key: string, member: string) { return (await DB.prepare('DELETE FROM redis_sorted WHERE key=? AND member_hash=?').bind(key,hash(member)).run()).meta.changes; },
    async zRemRangeByRank(key: string, start: number, stop: number) { const members=await client.zRange(key,start,stop); for(const member of members) await client.zRem(key,member); return members.length; }
  };
  return client;
}
