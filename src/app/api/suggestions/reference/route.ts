import { NextRequest, NextResponse } from 'next/server'
import { decodeHtmlEntities } from '@/lib/text/html-entities'

const MAX_HTML_LENGTH = 600_000

function readMeta(html: string, key: string) {
  const propertyPattern = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i')
  const namePattern = new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i')
  const reversedPropertyPattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["'][^>]*>`, 'i')
  const reversedNamePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["'][^>]*>`, 'i')
  const match = html.match(propertyPattern) || html.match(namePattern) || html.match(reversedPropertyPattern) || html.match(reversedNamePattern)

  return decodeHtmlEntities(match?.[1]?.replace(/\s+/g, ' ').trim())
}

function readTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return decodeHtmlEntities(match?.[1]?.replace(/\s+/g, ' ').trim())
}

function resolveMaybeRelativeUrl(value: string | undefined, baseUrl: string) {
  if (!value) return undefined

  try {
    return new URL(value, baseUrl).toString()
  } catch (_error) {
    return undefined
  }
}

function parseJsonLd(html: string) {
  try {
    const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    for (const match of matches) {
      const content = match[1].trim()
      if (!content) continue

      const parsed = JSON.parse(content)
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed]

      for (const item of items) {
        if (!item || typeof item !== 'object') continue

        let author: string | undefined
        if (item.author) {
          const authObj = Array.isArray(item.author) ? item.author[0] : item.author
          author = typeof authObj === 'string' ? authObj : authObj?.name
        }

        let rating: string | undefined
        if (item.aggregateRating && typeof item.aggregateRating === 'object') {
          rating = item.aggregateRating.ratingValue?.toString()
        }

        let chapters: string | undefined
        if (item.numberOfPages) {
          chapters = `${item.numberOfPages} pages`
        }

        let episodes: string | undefined
        if (item.numberOfEpisodes) {
          episodes = item.numberOfEpisodes.toString()
        }

        let releaseDate: string | undefined
        if (item.datePublished || item.releaseDate) {
          releaseDate = (item.datePublished || item.releaseDate)?.toString()
        }

        if (author || rating || chapters || episodes || releaseDate) {
          return { author, rating, chapters, episodes, releaseDate }
        }
      }
    }
  } catch (_error) {
    // Fail silently and use regex fallbacks
  }
  return null
}

function extractExtraDetails(html: string, url: string) {
  const isMal = url.includes('myanimelist.net')
  const isGoodreads = url.includes('goodreads.com')
  const isSteam = url.includes('steampowered.com')
  const isImdb = url.includes('imdb.com')
  const isSpotify = url.includes('spotify.com')
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')

  // Try JSON-LD parsing first
  const jsonLd = parseJsonLd(html)

  let episodes: string | undefined = jsonLd?.episodes
  let chapters: string | undefined = jsonLd?.chapters
  let author: string | undefined = jsonLd?.author
  let releaseDate: string | undefined = jsonLd?.releaseDate
  let rating: string | undefined = jsonLd?.rating

  // 1. Rating / Score Fallbacks
  if (!rating) {
    const malRating = html.match(/<span[^>]*itemprop=["']ratingValue["'][^>]*>([^<]+)/i)?.[1] || html.match(/<div[^>]*class=["']score-label[^"']*["'][^>]*>([^<]+)/i)?.[1]
    const imdbRating = html.match(/<span[^>]*class=["']AggregateRatingButton__RatingScore[^"']*["'][^>]*>([^<]+)/i)?.[1] || html.match(/<span[^>]*itemprop=["']ratingValue["'][^>]*>([^<]+)/i)?.[1]
    const goodreadsRating = html.match(/<div[^>]*class=["']RatingStatistics__rating["'][^>]*>([^<]+)/i)?.[1] || html.match(/itemprop=["']ratingValue["'][^>]*>([^<]+)/i)?.[1]
    const steamRating = html.match(/<span[^>]*class=["']nonresponsive_hidden responsive_reviewdesc["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]?.trim().replace(/\s+/g, ' ')

    rating = readMeta(html, 'books:rating:value') || readMeta(html, 'twitter:data1') || malRating || imdbRating || goodreadsRating || steamRating
  }

  if (rating) {
    rating = decodeHtmlEntities(rating.replace(/<[^>]+>/g, '').trim()) ?? ''
    if (rating.length > 50) rating = rating.substring(0, 50)
  }

  // 2. Episodes / Chapters / Pages
  if (!episodes && isMal) {
    const epMatch = html.match(/<span[^>]*>Episodes:<\/span>\s*([^<\n\r]+)/i)
    if (epMatch) episodes = epMatch[1].trim()
  }

  if (!chapters) {
    if (isMal) {
      const chMatch = html.match(/<span[^>]*>Chapters:<\/span>\s*([^<\n\r]+)/i)
      if (chMatch) chapters = chMatch[1].trim()
    } else if (isGoodreads) {
      const pageMatch = html.match(/(\d+)\s*pages/i)
      if (pageMatch) chapters = `${pageMatch[1]} pages`
    }
  }

  // 3. Author / Creator / Channel
  if (!author) {
    const genericAuthor = readMeta(html, 'book:author') || readMeta(html, 'author') || readMeta(html, 'music:musician') || readMeta(html, 'twitter:data2')
    const malAuthor = html.match(/<span[^>]*>Authors:<\/span>\s*<a[^>]*>([^<]+)/i)?.[1]
    const steamDeveloper = html.match(/<div[^>]*id=["']developers_list["'][^>]*>([\s\S]*?)<\/a>/i)?.[1]?.replace(/<[^>]+>/g, '').trim()
    const spotifyArtist = readMeta(html, 'music:musician') || html.match(/property=["']music:musician["'][^>]*content=["']([^"']*)["']/i)?.[1]

    if (isSpotify && spotifyArtist) {
      author = spotifyArtist.substring(spotifyArtist.lastIndexOf('/') + 1).replace(/-/g, ' ')
    } else if (isYoutube) {
      author = html.match(/<link[^>]*itemprop=["']name["'][^>]*content=["']([^"']*)["']/i)?.[1] || genericAuthor
    } else {
      author = malAuthor || steamDeveloper || genericAuthor
    }
  }

  if (author) {
    author = decodeHtmlEntities(author.replace(/<[^>]+>/g, '').trim()) ?? ''
    if (author.length > 60) author = author.substring(0, 60)
  }

  // 4. Release Date
  if (!releaseDate) {
    const malAired = html.match(/<span[^>]*>Aired:<\/span>\s*([^<\n\r]+)/i)
    const malPublished = html.match(/<span[^>]*>Published:<\/span>\s*([^<\n\r]+)/i)
    const steamRelease = html.match(/<div[^>]*class=["']date["'][^>]*>([^<]+)/i)?.[1] || html.match(/<div[^>]*class=["']grid_content grid_date["'][^>]*>([^<]+)/i)?.[1]
    const genericRelease = readMeta(html, 'video:release_date') || readMeta(html, 'article:published_time') || readMeta(html, 'music:release_date') || html.match(/property=["']music:release_date["'][^>]*content=["']([^"']*)["']/i)?.[1]

    releaseDate = (malAired?.[1] || malPublished?.[1] || steamRelease || genericRelease)?.trim()
  }

  if (releaseDate) {
    releaseDate = decodeHtmlEntities(releaseDate.replace(/<[^>]+>/g, '').trim()) ?? ''
    if (releaseDate.length > 50) releaseDate = releaseDate.substring(0, 50)
  }

  return { episodes, chapters, author, releaseDate, rating }
}

async function resolveSearchToDirectUrl(urlStr: string): Promise<string> {
  const isMalManga = urlStr.includes('myanimelist.net/manga.php')
  const isMalAnime = urlStr.includes('myanimelist.net/anime.php')
  const isImdb = urlStr.includes('imdb.com/find')
  const isGoodreads = urlStr.includes('goodreads.com/search')
  const isSteam = urlStr.includes('steampowered.com/search')
  
  if (!isMalManga && !isMalAnime && !isImdb && !isGoodreads && !isSteam) {
    return urlStr
  }
  
  try {
    const response = await fetch(urlStr, {
      headers: {
        'User-Agent': 'mikeblocky.com suggestion reference resolver'
      },
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) return urlStr
    
    const html = await response.text()
    
    if (isMalManga) {
      const match = html.match(/href=["'](https:\/\/myanimelist\.net\/manga\/\d+\/[^"']+)["']/i)
      if (match) return match[1]
    }
    
    if (isMalAnime) {
      const match = html.match(/href=["'](https:\/\/myanimelist\.net\/anime\/\d+\/[^"']+)["']/i)
      if (match) return match[1]
    }
    
    if (isImdb) {
      const match = html.match(/href=["'](\/title\/tt\d+\/[^"']*)["']/i)
      if (match) {
        return `https://www.imdb.com${match[1]}`
      }
    }
    
    if (isGoodreads) {
      const match = html.match(/href=["'](\/book\/show\/\d+[^"']*)["']/i)
      if (match) {
        return `https://www.goodreads.com${match[1]}`
      }
    }
    
    if (isSteam) {
      const match = html.match(/href=["'](https:\/\/store\.steampowered\.com\/app\/\d+\/[^"']+)["']/i)
      if (match) return match[1]
    }
  } catch (error) {
    console.error('Failed to resolve search URL:', error)
  }
  
  return urlStr
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url')
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
  }

  let resolvedUrlStr = urlParam
  try {
    resolvedUrlStr = await resolveSearchToDirectUrl(urlParam)
  } catch (_error) {
    // Fail silently and use original URL
  }

  let url: URL
  try {
    url = new URL(resolvedUrlStr)
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

    const extra = extractExtraDetails(html, url.toString())

    return NextResponse.json({
      reference: {
        url: url.toString(),
        title,
        description,
        image,
        siteName,
        type,
        ...extra
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load reference page' },
      { status: 502 }
    )
  }
}
