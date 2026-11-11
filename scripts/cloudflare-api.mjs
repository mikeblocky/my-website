import {spawnSync} from 'node:child_process';
export const account='4970ae1534c76f6630ce684cb25a940a';
export const database='df316882-2903-4173-92dd-64e89d027c5f';
let token;
export function cloudToken(){
  if(token)return token;
  const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','auth','token','--json'],{encoding:'utf8',maxBuffer:100000});
  if(result.status!==0)throw Error('Cloudflare authentication is unavailable. Run wrangler login.');
  const data=JSON.parse(result.stdout.slice(result.stdout.indexOf('{')));
  token=data.token||data.apiToken||data.oauthToken;
  if(typeof token!=='string')throw Error('Could not obtain Cloudflare authentication.');
  return token;
}
export async function cloudApi(route,options={}){
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${route}`,{...options,headers:{Authorization:`Bearer ${cloudToken()}`,...options.headers}});
  if(!response.ok){const failure=await response.json().catch(()=>({}));throw Error(`Cloudflare request failed (${response.status}) for ${route.split('?')[0]}: ${failure.errors?.map(item=>`${item.code}: ${item.message}`).join('; ')||'Request rejected'}`);}
  const data=await response.json();if(data.success===false)throw Error(`Cloudflare rejected request: ${data.errors?.map(e=>e.code).join(',')}`);return data.result;
}
export const sql=async(sql,params=[])=>cloudApi(`/d1/database/${database}/query`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sql,params})});
export const putObject=async(key,bytes)=>cloudApi(`/r2/buckets/mikeblocky-private/objects/${encodeURIComponent(key)}`,{method:'PUT',headers:{'content-type':'application/octet-stream'},body:bytes});
