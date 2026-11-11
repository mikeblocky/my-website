import {createClient,RESP_TYPES} from 'redis';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes,createCipheriv,createHash} from 'node:crypto';
import {sql,putObject} from './cloudflare-api.mjs';
const out='.private-backups';await mkdir(out,{recursive:true});
const settings=JSON.parse(await readFile(`${out}/source-env.json`,'utf8'));
if(!/^rediss?:\/\//.test(settings.REDIS_URL||''))throw Error('A valid source Redis connection is required.');
const client=createClient({url:settings.REDIS_URL,socket:{connectTimeout:10000,reconnectStrategy:false}});client.on('error',()=>{});await client.connect();
console.log('Connected to source Redis; exporting all keys.');
const raw=client.withTypeMapping({[RESP_TYPES.BLOB_STRING]:Buffer});
const entries=[],seen=new Set();
try {
 for await(const batch of client.scanIterator({COUNT:50})){await Promise.all(batch.map(async key=>{
  if(seen.has(key))return;seen.add(key);
  const type=await client.type(key);if(type==='none')return;
  const ttl=await client.pTTL(key),dump=await raw.dump(key);
  let value;
  if(type==='string')value=await client.get(key);
  else if(type==='zset')value=await client.zRangeWithScores(key,0,-1);
  else if(type==='hash')value=await client.hGetAll(key);
  else if(type==='list')value=await client.lRange(key,0,-1);
  else if(type==='set')value=await client.sMembers(key);
  else if(type==='stream')value=await client.xRange(key,'-','+');
  entries.push({key,type,value,expiresAt:ttl>=0?Date.now()+ttl:null,dump:dump?.toString('base64')});
 }));console.log(`Exported ${entries.length} keys.`);}
}finally{await client.quit();}
const snapshot=Buffer.from(JSON.stringify({version:1,createdAt:new Date().toISOString(),entries}));
const encryptionKey=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encryptionKey,iv);
const encrypted=Buffer.concat([cipher.update(snapshot),cipher.final()]);
const bundle=JSON.stringify({algorithm:'aes-256-gcm',iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),sha256:createHash('sha256').update(snapshot).digest('hex'),data:encrypted.toString('base64')});
const stamp=new Date().toISOString().replaceAll(':','-'),backup=`redis-${stamp}.encrypted.json`;
await writeFile(`${out}/${backup}`,bundle,{mode:0o600});await writeFile(`${out}/${backup}.key`,encryptionKey.toString('base64'),{mode:0o600});
console.log(`Encrypted backup saved: ${entries.length} Redis keys; ${snapshot.length} bytes.`);
if(!process.argv.includes('--import'))process.exit(0);
await putObject(`backups/${backup}`,bundle);
const pack=async(value)=>{if(Buffer.byteLength(value)<100000)return JSON.stringify({text:value});const key=`records/${createHash('sha256').update(value).digest('hex')}`;await putObject(key,value);return JSON.stringify({object:key});};
const counts={strings:0,sorted:0,hashes:0,archived:0};
for(const entry of entries){
 if(entry.expiresAt&&entry.expiresAt<=Date.now())continue;
 if(entry.type==='string'){await sql('INSERT OR REPLACE INTO redis_strings(key,value,expires_at) VALUES(?,?,?)',[entry.key,await pack(entry.value),entry.expiresAt]);counts.strings++;}
 else if(entry.type==='zset')for(const member of entry.value){await sql('INSERT OR REPLACE INTO redis_sorted(key,member_hash,value,score) VALUES(?,?,?,?)',[entry.key,createHash('sha256').update(member.value).digest('hex'),await pack(member.value),member.score]);counts.sorted++;}
 else if(entry.type==='hash')for(const[field,value]of Object.entries(entry.value)){await sql('INSERT OR REPLACE INTO redis_hashes(key,field,value) VALUES(?,?,?)',[entry.key,field,value]);counts.hashes++;}
 else {const key=`archive/${createHash('sha256').update(entry.key).digest('hex')}`;await putObject(key,JSON.stringify(entry));await sql('INSERT OR REPLACE INTO redis_archive(key,type,object_key,expires_at) VALUES(?,?,?,?)',[entry.key,entry.type,key,entry.expiresAt]);counts.archived++;}
}
await writeFile(`${out}/migration-audit.json`,JSON.stringify({backup,sourceKeys:entries.length,counts,completedAt:new Date().toISOString()},null,2),{mode:0o600});
console.log('Imported records:',counts);
for(const[table,count]of [['redis_strings',counts.strings],['redis_sorted',counts.sorted],['redis_hashes',counts.hashes],['redis_archive',counts.archived]]){
 const result=await sql(`SELECT COUNT(*) AS count FROM ${table}`);const actual=result[0].results[0].count;
 if(actual!==count)throw Error(`Verification failed for ${table}: expected ${count}, received ${actual}`);
}
console.log('Destination counts verified. Original Redis data was not modified.');
