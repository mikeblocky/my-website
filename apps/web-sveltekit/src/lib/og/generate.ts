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

export async function generatePng(
  element: Parameters<typeof satori>[0],
  width = 1200,
  height = 630
): Promise<Uint8Array> {
  const fonts = await getFonts()
  const svg = await satori(element, { width, height, fonts })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  return resvg.render().asPng()
}
