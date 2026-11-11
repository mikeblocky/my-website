import { satori, rendererReady } from '$ogRenderer'
import { Resvg } from '@cf-wasm/resvg'
import { PhotonImage } from '@cf-wasm/photon'

import regularFontUrl from './fonts/DM-Sans-400.ttf?inline';
import boldFontUrl from './fonts/DM-Sans-700.ttf?inline';
import symbolsFontUrl from './fonts/Noto-Sans-Symbols.ttf?inline';
import fallbackFontUrl from './fonts/Noto-Sans-Fallback.ttf?inline';

const decodeFont = (url: string) => {
  const bytes = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};
const fontRegular = decodeFont(regularFontUrl);
const fontBold = decodeFont(boldFontUrl);
const fontSymbols = decodeFont(symbolsFontUrl);
const fontFallback = decodeFont(fallbackFontUrl);

async function getFonts() {
  return [
    { name: 'DM Sans', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'DM Sans', data: fontBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Noto Sans', data: fontFallback, weight: 400 as const, style: 'normal' as const },
  ];
}

// DM Sans has no CJK glyphs; fetch only the Japanese characters needed by a card.
const fallbackFonts = new Map<string, Promise<ArrayBuffer>>();
function getJapaneseFont(text: string, symbols = false) {
  const family = symbols ? 'Noto+Sans+Symbols+2' : 'Noto+Sans+JP:wght@700';
  const key = `${family}:${text}`;
  let pending = fallbackFonts.get(key);
  if (!pending) {
    pending = (async () => {
      const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(response => response.text());
      const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/)?.[1];
      if (!url) throw new Error('Could not resolve Japanese thumbnail font');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Could not load Japanese thumbnail font');
      return response.arrayBuffer();
    })();
    fallbackFonts.set(key, pending);
    pending.catch(() => fallbackFonts.delete(key));
    if (fallbackFonts.size > 64) fallbackFonts.delete(fallbackFonts.keys().next().value!);
  }
  return pending;
}

// Convert an emoji string to its Twemoji CDN codepoint path (e.g. "1f600" or "1f1fa-1f1f8")
function emojiToTwemojiPath(emoji: string): string {
  const points: string[] = []
  for (const char of emoji) {
    const cp = char.codePointAt(0)
    if (cp !== undefined && cp !== 0xfe0f) {
      // Skip variation selector U+FE0F — Twemoji file names omit it
      points.push(cp.toString(16))
    }
  }
  return points.join('-')
}

const emojiCache = new Map<string, string>()

async function loadEmoji(segment: string): Promise<string> {
  if (emojiCache.has(segment)) return emojiCache.get(segment)!
  const path = emojiToTwemojiPath(segment)
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${path}.svg`
  try {
    const res = await fetch(url)
    if (!res.ok) return ''
    const svg = await res.text()
    const b64 = Buffer.from(svg).toString('base64')
    const dataUrl = `data:image/svg+xml;base64,${b64}`
    emojiCache.set(segment, dataUrl)
    return dataUrl
  } catch {
    return ''
  }
}

export async function generatePng(
  element: Parameters<typeof satori>[0],
  width = 1200,
  height = 630
): Promise<ArrayBuffer> {
  await rendererReady();
  // Satori's image parser does not support all uploaded raster formats.
  // Normalize embedded WebP/AVIF/GIF attachments before measuring/rendering them.
  const normalizeImages = async (node: any): Promise<any> => {
    if (Array.isArray(node)) return Promise.all(node.map(normalizeImages));
    if (!node || typeof node !== 'object' || !node.props) return node;
    const props = { ...node.props };
    if (node.type === 'img' && typeof props.src === 'string' && /^data:image\/(webp|avif|gif);base64,/i.test(props.src)) {
      const input = PhotonImage.new_from_byteslice(Buffer.from(props.src.split(',')[1], 'base64'));
      let png: Uint8Array;
      try { png = input.get_bytes(); } finally { input.free(); }
      props.src = `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
    }
    if (props.children) props.children = await normalizeImages(props.children);
    return { ...node, props };
  };
  element = await normalizeImages(element);
  const fonts = await getFonts()
  const textOf = (node: any): string => typeof node === 'string' ? node : Array.isArray(node) ? node.map(textOf).join('') : node?.props ? textOf(node.props.children) : '';
  const japanese = [...new Set(textOf(element).match(/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/gu) || [])].join('');
  if (japanese) fonts.push({ name: 'Noto Sans JP', data: await getJapaneseFont(japanese), weight: 700, style: 'normal' });
  const symbols = [...new Set(textOf(element).match(/[\u2000-\u2bff]/gu) || [])].join('');
  if (symbols) fonts.push({ name: 'Noto Sans Symbols', data: fontSymbols, weight: 400, style: 'normal' });
  const svg = await satori(element, {
    width,
    height,
    fonts,
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === 'emoji') return loadEmoji(segment)
      if (/[\u2000-\u2bff]/u.test(segment)) return [{name:'Noto Sans Symbols',data:fontSymbols,weight:400,style:'normal'}];
      if (/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/u.test(segment)) return [{ name: 'Noto Sans JP', data: await getJapaneseFont(segment), weight: 700, style: 'normal' }];
      return ''
    },
  })
  const resvg = await Resvg.async(svg, { fitTo: { mode: 'width', value: width } })
  try {
    const png = resvg.render().asPng()
    return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer
  } finally { resvg.free(); }
}
