import { generatePng } from './generate';

const ttl = 60 * 60 * 1000;
const cards = new Map<string, { expires: number; png: Promise<ArrayBuffer> }>();

/** Random colors are picked at generation time, then shared by all crawlers for an hour. */
export async function socialImageResponse(key: string, element: any) {
  let card = cards.get(key);
  if (!card || card.expires <= Date.now()) {
    card = { expires: Date.now() + ttl, png: generatePng(element, 1200, Number(element.props.style.height)) };
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
