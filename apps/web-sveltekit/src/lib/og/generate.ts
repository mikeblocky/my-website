import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

let fontRegular: ArrayBuffer | null = null
let fontBold: ArrayBuffer | null = null

async function fetchFontFromGoogleFonts(weight: 400 | 700): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then((r) => r.text())

  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2?)'\)/)?.[1]
  if (!url) throw new Error(`Could not parse font URL from Google Fonts CSS (weight ${weight})`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font binary: ${res.status}`)
  return res.arrayBuffer()
}

async function getFonts() {
  if (!fontRegular) fontRegular = await fetchFontFromGoogleFonts(400)
  if (!fontBold) fontBold = await fetchFontFromGoogleFonts(700)
  return [
    { name: 'Inter', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fontBold, weight: 700 as const, style: 'normal' as const },
  ]
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
  const svg = await satori(element, {
    width,
    height,
    fonts,
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === 'emoji') return loadEmoji(segment)
      return ''
    },
  })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  const png = resvg.render().asPng()
  return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer
}
