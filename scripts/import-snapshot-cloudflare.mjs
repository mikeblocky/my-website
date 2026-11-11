import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createDecipheriv,createHash} from 'node:crypto';
import {sql,putObject} from './cloudflare-api.mjs';
const folder='.private-backups',names=(await readdir(folder)).filter(x=>x.endsWith('.encrypted.json')).sort(),name=names.at(-1);
if(!name)throw Error('No encrypted Redis snapshot found.');
const backup=JSON.parse(await readFile(`${folder}/${name}`,'utf8')),key=Buffer.from(await readFile(`${folder}/${name}.key`,'utf8'),'base64');
const decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(backup.iv,'base64'));decipher.setAuthTag(Buffer.from(backup.tag,'base64'));
const snapshot=Buffer.concat([decipher.update(Buffer.from(backup.data,'base64')),decipher.final()]);
if(createHash('sha256').update(snapshot).digest('hex')!==backup.sha256)throw Error('Backup checksum failed.');
const {entries}=JSON.parse(snapshot);console.log(`Verified encrypted snapshot: ${entries.length} keys.`);
if(process.argv.includes('--replace'))for(const table of ['redis_strings','redis_sorted','redis_hashes','redis_archive'])await sql(`DELETE FROM ${table}`);
const strings=[],sorted=[],hashes=[],archive=[];
const pack=async value=>{if(Buffer.byteLength(value)<100000)return JSON.stringify({text:value});const key=`records/${createHash('sha256').update(value).digest('hex')}`;await putObject(key,value);return JSON.stringify({object:key});};
for(let i=0;i<entries.length;i+=20){await Promise.all(entries.slice(i,i+20).map(async e=>{
 if(e.expiresAt&&e.expiresAt<=Date.now())return;
 if(e.type==='string')strings.push([e.key,await pack(e.value),e.expiresAt]);
 else if(e.type==='zset')for(const member of e.value)sorted.push([e.key,createHash('sha256').update(member.value).digest('hex'),await pack(member.value),member.score]);
 else if(e.type==='hash')for(const[field,value]of Object.entries(e.value))hashes.push([e.key,field,value]);
 else {const key=`archive/${createHash('sha256').update(e.key).digest('hex')}`;await putObject(key,JSON.stringify(e));archive.push([e.key,e.type,key,e.expiresAt]);}
}));}
const groups=[['redis_strings','key,value,expires_at',strings],['redis_sorted','key,member_hash,value,score',sorted],['redis_hashes','key,field,value',hashes],['redis_archive','key,type,object_key,expires_at',archive]];
for(const[table,columns,rows]of groups){for(let i=0;i<rows.length;i+=20){const chunk=rows.slice(i,i+20);await sql(`INSERT OR REPLACE INTO ${table}(${columns}) VALUES ${chunk.map(row=>'('+row.map(()=>'?').join(',')+')').join(',')}`,chunk.flat());}
 const result=await sql(`SELECT COUNT(*) AS count FROM ${table}`);const actual=result[0].results[0].count;
 if(actual!==rows.length)throw Error(`Count mismatch in ${table}: ${actual}/${rows.length}`);
 console.log(`${table}: ${actual} records verified.`);
}
await writeFile(`${folder}/migration-audit.json`,JSON.stringify({backup:name,sha256:backup.sha256,sourceKeys:entries.length,counts:Object.fromEntries(groups.map(([table,,rows])=>[table,rows.length])),completedAt:new Date().toISOString()},null,2),{mode:0o600});
console.log('Migration verified. Redis source was retained unchanged.');
