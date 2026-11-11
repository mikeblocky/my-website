import { error, type Handle } from '@sveltejs/kit';
import { privateHeaders } from '$lib/server/vault';
import { env } from '$env/dynamic/private';
export const handle: Handle = async ({event,resolve}) => {
  const privateRoute=event.url.pathname.startsWith('/commissions/files');
  if(env.MIGRATION_READ_ONLY==='1'&&(!['GET','HEAD','OPTIONS'].includes(event.request.method)||event.url.pathname==='/api/activity/callback'))return new Response(JSON.stringify({error:'The fallback is read only. Please use www.mikeblocky.com to make changes.'}),{status:503,headers:{'content-type':'application/json','cache-control':'no-store'}});
  if(!['GET','HEAD','OPTIONS'].includes(event.request.method)) {
    const origin=event.request.headers.get('origin');
    if((origin&&origin!==event.url.origin)||(privateRoute&&origin!==event.url.origin)||event.request.headers.get('sec-fetch-site')==='cross-site')error(403,'Cross-site request rejected.');
    if(privateRoute&&event.request.body) {
      const maximum=event.url.searchParams.has('/upload')?16000000:16384;
      const reader=event.request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();error(413,'Request is too large.');}chunks.push(value);}
      const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
      event.request=new Request(event.request,{body});
    }
  }
  const response=await resolve(event);
  response.headers.set('x-content-type-options','nosniff');
  response.headers.set('referrer-policy',privateRoute?'same-origin':'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy','camera=(), microphone=(), geolocation=()');
  if(privateRoute)for(const [key,value]of Object.entries(privateHeaders))response.headers.set(key,value);
  return response;
};
