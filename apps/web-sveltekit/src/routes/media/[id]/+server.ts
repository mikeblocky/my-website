import { error } from '@sveltejs/kit';
import { requireCloud } from '$lib/server/cloudflare';
import type { RequestHandler } from './$types';
export const GET: RequestHandler=async({params})=>{
  if(!/^[a-f0-9]{64}$/.test(params.id))error(404,'Not found.');
  const {DB,PRIVATE_FILES}=requireCloud();
  const file=await DB.prepare('SELECT object_key,mime,size FROM public_media WHERE id=?').bind(params.id).first<{object_key:string;mime:string;size:number}>();
  if(!file||!file.object_key.startsWith('public-media/'))error(404,'Not found.');
  const object=await PRIVATE_FILES.get(file.object_key);if(!object)error(404,'Not found.');
  return new Response(object.body,{headers:{'content-type':file.mime,'content-length':String(file.size),'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; sandbox"}});
};
