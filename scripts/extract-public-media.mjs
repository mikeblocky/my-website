import{sql,putObject,cloudToken,account}from'./cloudflare-api.mjs';import{createHash}from'node:crypto';import{imageSize}from'image-size';import{writeFile}from'node:fs/promises';
const keys=['talk:messages','ask:questions','sketchbook:drawings','draw:prompts','suggestions:media'];
const rows=(await sql(`SELECT * FROM redis_sorted WHERE key IN (${keys.map(()=>'?').join(',')})`,keys))[0].results;
const media=new Map();let changed=0,bytesRemoved=0;
async function unpack(value){const p=JSON.parse(value);if(typeof p.text==='string')return p.text;const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets/mikeblocky-private/objects/${encodeURIComponent(p.object)}`,{headers:{Authorization:`Bearer ${cloudToken()}`}});if(!r.ok)throw Error('Source record unavailable.');return r.text();}
async function transform(value){
 if(typeof value==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(value)){
  const mime=value.slice(5,value.indexOf(';')),bytes=Buffer.from(value.split(',')[1],'base64'),id=createHash('sha256').update(bytes).digest('hex'),size=imageSize(bytes),key=`public-media/${id}`;
  if(!media.has(id)){await putObject(key,bytes);await sql('INSERT OR REPLACE INTO public_media(id,object_key,mime,size,width,height) VALUES(?,?,?,?,?,?)',[id,key,mime,bytes.length,size.width,size.height]);media.set(id,{id,width:size.width,height:size.height,size:bytes.length});bytesRemoved+=value.length;}
  return `/media/${id}?w=${size.width}&h=${size.height}`;
 }
 if(Array.isArray(value)){const result=[];for(const item of value)result.push(await transform(item));return result;}
 if(value&&typeof value==='object'){const result={};for(const[k,v]of Object.entries(value))result[k]=await transform(v);return result;}
 return value;
}
for(const row of rows){const original=await unpack(row.value),value=JSON.stringify(await transform(JSON.parse(original)));if(value!==original){const member_hash=createHash('sha256').update(value).digest('hex');await sql('INSERT OR REPLACE INTO redis_sorted(key,member_hash,value,score) VALUES(?,?,?,?)',[row.key,member_hash,JSON.stringify({text:value}),row.score]);await sql('DELETE FROM redis_sorted WHERE key=? AND member_hash=?',[row.key,row.member_hash]);changed++;}}
await writeFile('.private-backups/public-media-audit.json',JSON.stringify({changed,images:media.size,bytesRemoved,media:[...media.values()]},null,2),{mode:0o600});
console.log(`Extracted ${media.size} public images from ${changed} records; removed ${(bytesRemoved/1000000).toFixed(1)} MB of inline data. Private commission files were not changed.`);
