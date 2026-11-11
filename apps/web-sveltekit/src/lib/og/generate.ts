import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

import regularFontUrl from './fonts/DM-Sans-400.ttf?inline';
import boldFontUrl from './fonts/DM-Sans-700.ttf?inline';

const decodeFont = (url: string) => {
  const bytes = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};
const fontRegular = decodeFont(regularFontUrl);
const fontBold = decodeFont(boldFontUrl);

async function getFonts() {
  return [
    { name: 'DM Sans', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'DM Sans', data: fontBold, weight: 700 as const, style: 'normal' as const },
  ];
}

// DM Sans has no CJK glyphs; fetch only the Japanese characters needed by a card.
const fallbackFonts = new Map<string, Promise<ArrayBuffer>>();
function getJapaneseFont(text: string) {
  let pending = fallbackFonts.get(text);
  if (!pending) {
    pending = (async () => {
      const css = await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(response => response.text());
      const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/)?.[1];
      if (!url) throw new Error('Could not resolve Japanese thumbnail font');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Could not load Japanese thumbnail font');
      return response.arrayBuffer();
    })();
    fallbackFonts.set(text, pending);
    pending.catch(() => fallbackFonts.delete(text));
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
  const fonts = await getFonts()
  const textOf = (node: any): string => typeof node === 'string' ? node : Array.isArray(node) ? node.map(textOf).join('') : node?.props ? textOf(node.props.children) : '';
  const japanese = [...new Set(textOf(element).match(/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/gu) || [])].join('');
  if (japanese) fonts.push({ name: 'Noto Sans JP', data: await getJapaneseFont(japanese), weight: 700, style: 'normal' });
  const svg = await satori(element, {
    width,
    height,
    fonts,
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === 'emoji') return loadEmoji(segment)
      if (/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/u.test(segment)) return [{ name: 'Noto Sans JP', data: await getJapaneseFont(segment), weight: 700, style: 'normal' }];
      return ''
    },
  })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  const png = resvg.render().asPng()
  return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer
}
