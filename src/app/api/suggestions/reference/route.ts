import { NextRequest, NextResponse } from 'next/server'

const MAX_HTML_LENGTH = 600_000

function readMeta(html: string, key: string) {
  const propertyPattern = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i')
  const namePattern = new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i')
  const reversedPropertyPattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["'][^>]*>`, 'i')
  const reversedNamePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["'][^>]*>`, 'i')
  const match = html.match(propertyPattern) || html.match(namePattern) || html.match(reversedPropertyPattern) || html.match(reversedNamePattern)

  return match?.[1]?.replace(/\s+/g, ' ').trim()
}

function readTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return match?.[1]?.replace(/\s+/g, ' ').trim()
}

function resolveMaybeRelativeUrl(value: string | undefined, baseUrl: string) {
  if (!value) return undefined

  try {
    return new URL(value, baseUrl).toString()
  } catch (_error) {
    return undefined
  }
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(urlParam)
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'mikeblocky.com suggestion reference preview'
      },
      signal: AbortSignal.timeout(7000)
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Reference page responded with ${response.status}` }, { status: 502 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return NextResponse.json({ error: 'Reference URL is not an HTML page' }, { status: 415 })
    }

    const html = (await response.text()).slice(0, MAX_HTML_LENGTH)
    const title = readMeta(html, 'og:title') || readMeta(html, 'twitter:title') || readTitle(html)
    const description = readMeta(html, 'og:description') || readMeta(html, 'twitter:description') || readMeta(html, 'description')
    const image = resolveMaybeRelativeUrl(readMeta(html, 'og:image') || readMeta(html, 'twitter:image'), url.toString())
    const siteName = readMeta(html, 'og:site_name') || url.hostname.replace(/^www\./, '')
    const type = readMeta(html, 'og:type')

    return NextResponse.json({
      reference: {
        url: url.toString(),
        title,
        description,
        image,
        siteName,
        type
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load reference page' },
      { status: 502 }
    )
  }
}
