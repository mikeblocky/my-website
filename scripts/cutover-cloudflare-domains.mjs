import{cloudToken}from'./cloudflare-api.mjs';import{writeFile}from'node:fs/promises';
const root='https://api.cloudflare.com/client/v4/zones/7976f312ed767e7a7bfef1881d416a0a/workers/routes';
async function request(url,options={}){const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${cloudToken()}`,'content-type':'application/json'}});const data=await r.json();if(!r.ok||data.success===false)throw Error(`Route update rejected (${r.status}): ${data.errors?.map(e=>e.message).join(';')}`);return data.result;}
const before=await request(root),patterns=['mikeblocky.com/*','www.mikeblocky.com/*'];
await writeFile('.private-backups/worker-routes-before-cutover.json',JSON.stringify(before.filter(route=>patterns.includes(route.pattern))),{mode:0o600});
for(const pattern of patterns){const existing=before.find(route=>route.pattern===pattern);await request(root+(existing?'/'+existing.id:''),{method:existing?'PUT':'POST',body:JSON.stringify({pattern,script:'mikeblocky-site'})});}
console.log('Cloudflare Worker is primary for mikeblocky.com and www.mikeblocky.com. Vercel DNS and all other routes were preserved.');
