import{readdir,readFile,writeFile}from'node:fs/promises';import{createDecipheriv,createHash}from'node:crypto';import{sql,putObject}from'./cloudflare-api.mjs';
const dir='.private-backups',names=(await readdir(dir)).filter(x=>x.endsWith('.encrypted.json')).sort();
async function open(name){const b=JSON.parse(await readFile(`${dir}/${name}`,'utf8')),key=Buffer.from(await readFile(`${dir}/${name}.key`,'utf8'),'base64'),d=createDecipheriv('aes-256-gcm',key,Buffer.from(b.iv,'base64'));d.setAuthTag(Buffer.from(b.tag,'base64'));return JSON.parse(Buffer.concat([d.update(Buffer.from(b.data,'base64')),d.final()]));}
const first=await open(names[0]),last=await open(names.at(-1)),old=new Map(first.entries.map(e=>[e.key,e]));
const changes=last.entries.filter(e=>{const before=old.get(e.key);return !before||before.type!==e.type||JSON.stringify(before.value)!==JSON.stringify(e.value)||before.dump!==e.dump;});
const pack=async value=>{if(Buffer.byteLength(value)<100000)return JSON.stringify({text:value});const key=`records/${createHash('sha256').update(value).digest('hex')}`;await putObject(key,value);return JSON.stringify({object:key});};
for(const e of changes){
 if(e.type==='string')await sql('INSERT OR REPLACE INTO redis_strings(key,value,expires_at) VALUES(?,?,?)',[e.key,await pack(e.value),e.expiresAt]);
 else if(e.type==='hash'){await sql('DELETE FROM redis_hashes WHERE key=?',[e.key]);const rows=Object.entries(e.value).map(([field,value])=>[e.key,field,value]);for(let i=0;i<rows.length;i+=20){const chunk=rows.slice(i,i+20);await sql(`INSERT INTO redis_hashes(key,field,value) VALUES ${chunk.map(()=>'(?,?,?)').join(',')}`,chunk.flat());}}
 else if(e.type==='zset'){await sql('DELETE FROM redis_sorted WHERE key=?',[e.key]);for(const m of e.value)await sql('INSERT INTO redis_sorted(key,member_hash,value,score) VALUES(?,?,?,?)',[e.key,createHash('sha256').update(m.value).digest('hex'),await pack(m.value),m.score]);}
 else{const key=`archive/${createHash('sha256').update(e.key).digest('hex')}`;await putObject(key,JSON.stringify(e));await sql('INSERT OR REPLACE INTO redis_archive(key,type,object_key,expires_at) VALUES(?,?,?,?)',[e.key,e.type,key,e.expiresAt]);}
}
for(const e of first.entries.filter(e=>!last.entries.some(x=>x.key===e.key)))for(const table of ['redis_strings','redis_hashes','redis_sorted','redis_archive'])await sql(`DELETE FROM ${table} WHERE key=?`,[e.key]);
await writeFile(`${dir}/final-delta-audit.json`,JSON.stringify({backup:names.at(-1),keys:last.entries.length,changed:changes.length,types:changes.map(e=>e.type),completedAt:new Date().toISOString()},null,2),{mode:0o600});
console.log(`Synchronized final changes to ${changes.length} Redis keys. Source was not modified.`);
