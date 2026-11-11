import { createHash } from 'node:crypto';
import { imageSize } from 'image-size';
import type { CloudBindings } from '$lib/server/cloudflare';
export async function extractPublicMedia(value:unknown,cloud:CloudBindings):Promise<unknown>{
  if(typeof value==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(value)){
    const mime=value.slice(5,value.indexOf(';')),bytes=Buffer.from(value.split(',')[1],'base64'),id=createHash('sha256').update(bytes).digest('hex'),info=imageSize(bytes),key=`public-media/${id}`;
    await cloud.PRIVATE_FILES.put(key,bytes);
    await cloud.DB.prepare('INSERT OR IGNORE INTO public_media(id,object_key,mime,size,width,height) VALUES(?,?,?,?,?,?)').bind(id,key,mime,bytes.length,info.width,info.height).run();
    return `/media/${id}?w=${info.width}&h=${info.height}`;
  }
  if(Array.isArray(value)){const result=[];for(const item of value)result.push(await extractPublicMedia(item,cloud));return result;}
  if(value&&typeof value==='object'){const result:Record<string,unknown>={};for(const[key,item]of Object.entries(value))result[key]=await extractPublicMedia(item,cloud);return result;}
  return value;
}
