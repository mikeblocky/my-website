import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

// Cached font buffer — fetched once per server process
let fontRegular: ArrayBuffer | null = null
let fontBold: ArrayBuffer | null = null

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font: ${res.status}`)
  return res.arrayBuffer()
}

async function getFonts() {
  if (!fontRegular) {
    fontRegular = await loadFont(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff'
    )
  }
  if (!fontBold) {
    fontBold = await loadFont(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff'
    )
  }
  return [
    { name: 'Inter', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fontBold,    weight: 700 as const, style: 'normal' as const },
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
