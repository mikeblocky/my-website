import{readFile,readdir,writeFile}from'node:fs/promises';import{createDecipheriv,createHash}from'node:crypto';import{sql,cloudToken,account}from'./cloudflare-api.mjs';
const folder='.private-backups',name=(await readdir(folder)).filter(x=>x.endsWith('.encrypted.json')).sort().at(-1);
const backup=JSON.parse(await readFile(`${folder}/${name}`,'utf8')),key=Buffer.from(await readFile(`${folder}/${name}.key`,'utf8'),'base64');
const d=createDecipheriv('aes-256-gcm',key,Buffer.from(backup.iv,'base64'));d.setAuthTag(Buffer.from(backup.tag,'base64'));const raw=Buffer.concat([d.update(Buffer.from(backup.data,'base64')),d.final()]);
if(createHash('sha256').update(raw).digest('hex')!==backup.sha256)throw Error('Snapshot checksum failed.');
const {entries}=JSON.parse(raw),expected={redis_strings:new Map(),redis_sorted:new Map(),redis_hashes:new Map(),redis_archive:new Map()};
for(const e of entries){if(e.expiresAt&&e.expiresAt<=Date.now())continue;
 if(e.type==='string')expected.redis_strings.set(e.key,e.value);
 else if(e.type==='zset')for(const m of e.value)expected.redis_sorted.set(e.key+'\0'+createHash('sha256').update(m.value).digest('hex'),{value:m.value,score:m.score});
 else if(e.type==='hash')for(const[k,v]of Object.entries(e.value))expected.redis_hashes.set(e.key+'\0'+k,v);
 else expected.redis_archive.set(e.key,e);
}
const publicExpected=new Map();
for(const entry of entries.filter(e=>e.type==='zset'))for(const member of entry.value){try{const post=JSON.parse(member.value);if(post.id)publicExpected.set(entry.key+'\0'+post.id,member);}catch{}}
const mediaCache=new Map();
async function restoreMedia(value){
 if(typeof value==='string'&&/^\/media\/[a-f0-9]{64}(\?|$)/.test(value)){const id=value.split('/')[2].split('?')[0];if(!mediaCache.has(id))mediaCache.set(id,(async()=>{const file=(await sql('SELECT object_key,mime FROM public_media WHERE id=?',[id]))[0].results[0];if(!file)throw Error('Public image metadata missing.');const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/mikeblocky-private/objects/${encodeURIComponent(file.object_key)}`,{headers:{Authorization:`Bearer ${cloudToken()}`}});if(!r.ok)throw Error('Public image bytes missing.');const bytes=Buffer.from(await r.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==id)throw Error('Public image checksum mismatch.');return `data:${file.mime};base64,${bytes.toString('base64')}`;})());return mediaCache.get(id);}
 if(Array.isArray(value)){const result=[];for(const item of value)result.push(await restoreMedia(item));return result;}
 if(value&&typeof value==='object'){const result={};for(const[k,v]of Object.entries(value))result[k]=await restoreMedia(v);return result;}
 return value;
}
let verified=0,objects=0;
async function getObject(key){objects++;const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/mikeblocky-private/objects/${encodeURIComponent(key)}`,{headers:{Authorization:`Bearer ${cloudToken()}`}});if(!r.ok)throw Error('Stored object unavailable.');return r.text();}
async function unpack(value){const p=JSON.parse(value);return typeof p.text==='string'?p.text:getObject(p.object);}
for(const[table,map]of Object.entries(expected)){
 const rows=(await sql(`SELECT * FROM ${table}`))[0].results;
 for(let i=0;i<rows.length;i+=10)await Promise.all(rows.slice(i,i+10).map(async row=>{
  const key=table==='redis_sorted'?row.key+'\0'+row.member_hash:table==='redis_hashes'?row.key+'\0'+row.field:row.key;
  if(!map.has(key)&&table!=='redis_sorted')throw Error(`Unexpected destination record in ${table}`);
  const original=map.get(key);
  if(table==='redis_archive'){if(JSON.stringify(JSON.parse(await getObject(row.object_key)))!==JSON.stringify(original))throw Error('Archived data mismatch.');}
  else if(table==='redis_sorted'){const stored=await unpack(row.value);if(original){if(stored!==original.value||row.score!==original.score)throw Error('Sorted content mismatch.');}else{const post=JSON.parse(stored),expected=publicExpected.get(row.key+'\0'+post.id);if(!expected||JSON.stringify(await restoreMedia(post))!==JSON.stringify(JSON.parse(expected.value))||row.score!==expected.score)throw Error('Public record or image content mismatch.');}}
  else if((table==='redis_strings'?await unpack(row.value):row.value)!==original)throw Error(`Content mismatch in ${table}`);
  verified++;
 }));
 if(rows.length!==map.size)throw Error(`Record count mismatch in ${table}`);
}
const audit=JSON.parse(await readFile(`${folder}/migration-audit.json`,'utf8'));audit.integrity={records:verified,objects,verifiedAt:new Date().toISOString(),fullContentMatch:true,restoredPublicImages:mediaCache.size,finalBackup:name};await writeFile(`${folder}/migration-audit.json`,JSON.stringify(audit,null,2),{mode:0o600});
console.log(`Verified full content and scores of ${verified} records, including ${objects} R2 objects and ${mediaCache.size} original public images.`);
