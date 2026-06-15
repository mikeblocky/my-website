import type { Metadata } from 'next'

const SITE_URL = 'https://www.mikeblocky.com'

type SocialMetadataOptions = {
    title: string
    description: string
    path?: string
    imagePath?: string
    twitterImagePath?: string
    imageAlt?: string
    type?: 'website' | 'article'
    publishedTime?: string
}

export function absoluteSiteUrl(path = '/') {
    if (/^https?:\/\//.test(path)) {
        return path
    }

    return new URL(path, SITE_URL).toString()
}

export function buildSocialMetadata({
    title,
    description,
    path,
    imagePath = '/opengraph-image.jpg',
    twitterImagePath = '/twitter-image.jpg',
    imageAlt,
    type = 'website',
    publishedTime
}: SocialMetadataOptions): Metadata {
    const openGraphImageUrl = imagePath ? absoluteSiteUrl(imagePath) : undefined
    const twitterImageUrl = twitterImagePath
        ? absoluteSiteUrl(twitterImagePath)
        : openGraphImageUrl

    const openGraphImage = openGraphImageUrl
        ? [
              {
                  url: openGraphImageUrl,
                  width: 1200,
                  height: 630,
                  alt: imageAlt ?? description,
              }
          ]
        : undefined

    const twitterImages = twitterImageUrl ? [twitterImageUrl] : undefined

    return {
        title,
        description,
        alternates: path ? { canonical: absoluteSiteUrl(path) } : undefined,
        openGraph: {
            siteName: 'mikeblocky.com',
            title,
            description,
            type,
            url: path ? absoluteSiteUrl(path) : undefined,
            images: openGraphImage,
            ...(publishedTime ? { publishedTime } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: twitterImages,
        },
    }
}
