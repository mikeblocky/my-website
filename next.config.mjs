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
  async rewrites() {
    return [
      {
        source: '/learning/weekly-reflections/week-:num',
        destination: '/learning/weekly-reflections/weeks/week-:num',
      },
    ]
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
