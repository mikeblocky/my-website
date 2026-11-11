import { generatePng } from '$ogGenerate';
import { cloudBindings } from '$lib/server/cloudflare';
import { socialObjectKey } from './social-cache';

const ttl = 60 * 60 * 1000;
const cards = new Map<string, { expires: number; png: Promise<ArrayBuffer> }>();

/** Per-item palettes and layouts are cached so all crawlers receive the same card. */
export async function socialImageResponse(key: string, element: any) {
  const measuredHeight=Number(element.props.style.height);
  const height=Number.isFinite(measuredHeight)&&measuredHeight>0?measuredHeight:630;
  const cloud=cloudBindings();
  if(cloud?.PRIVATE_FILES){
    const objectKey=socialObjectKey(key,element),cached=await cloud.PRIVATE_FILES.get(objectKey);
    if(cached)return new Response(cached.body,{headers:{'content-type':'image/png','cache-control':'public,max-age=3600','x-content-type-options':'nosniff'}});
    try{const png=await generatePng(element,1200,height);await cloud.PRIVATE_FILES.put(objectKey,new Uint8Array(png));return new Response(png,{headers:{'content-type':'image/png','cache-control':'public,max-age=3600'}});}
    catch(error){console.warn('Social render unavailable:',error instanceof Error?error.message.slice(0,180):'Unknown renderer error');const fallback=await cloud.PRIVATE_FILES.get('social/default.png');if(fallback)return new Response(fallback.body,{headers:{'content-type':'image/png','cache-control':'public,max-age=60','x-thumbnail-source':'fallback'}});return new Response('Thumbnail temporarily unavailable',{status:503,headers:{'retry-after':'60'}});}
  }
  let card = cards.get(key);
  if (!card || card.expires <= Date.now()) {
    card = { expires: Date.now() + ttl, png: generatePng(element, 1200, height) };
    cards.set(key, card);
    const pending = card;
    card.png.catch(() => { if (cards.get(key) === pending) cards.delete(key); });
    if (cards.size > 64) cards.delete(cards.keys().next().value!);
  }
  const png = await card.png;
  return new Response(png, { headers: {
    'Content-Type': 'image/png',
    'Content-Length': String(png.byteLength),
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    'X-Content-Type-Options': 'nosniff'
  } });
}
