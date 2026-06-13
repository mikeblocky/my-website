import createMDX from '@next/mdx'
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.thecatapi.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.thedogapi.com',
      },
    ],
  },
  outputFileTracingExcludes: {
    '*': ['public/distribution/**/*'],
  },
  async rewrites() {
    return [
      {
        source: '/learning/weekly-reflections/week-:num',
        destination: '/learning/weekly-reflections/weeks/week-:num',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/journal',
        permanent: true,
      },
      {
        source: '/diary',
        destination: '/journal',
        permanent: true,
      },
      {
        source: '/stats',
        destination: '/artworks',
        permanent: true,
      },
      {
        source: '/talk',
        destination: '/interact',
        permanent: true,
      },
      {
        source: '/draw',
        destination: '/interact',
        permanent: true,
      },
      {
        source: '/suggestions',
        destination: '/interact?tab=suggestions',
        permanent: true,
      },
    ]
  },
  async headers() {
    const headers = [
      {
        source: '/journal',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, no-transform',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/journal/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, no-transform',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Cloudflare-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/distribution/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
    return headers
  },
}
 
const withMDX = createMDX({
})

const config = withMDX(nextConfig)

// Move deprecated experimental.turbo options into config.turbopack.
if (config.experimental?.turbo) {
  const { turbo, ...restExperimental } = config.experimental
  const existingTurbopack = config.turbopack ?? {}

  const mergedTurbopack = {
    ...existingTurbopack,
    ...turbo,
    ...(existingTurbopack.rules || turbo.rules
      ? {
          rules: {
            ...existingTurbopack.rules,
            ...turbo.rules,
          },
        }
      : {}),
    ...(existingTurbopack.resolveAlias || turbo.resolveAlias
      ? {
          resolveAlias: {
            ...existingTurbopack.resolveAlias,
            ...turbo.resolveAlias,
          },
        }
      : {}),
  }

  config.turbopack = mergedTurbopack

  if (Object.keys(restExperimental).length > 0) {
    config.experimental = restExperimental
  } else {
    delete config.experimental
  }
}

export default config
