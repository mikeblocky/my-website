export function getHighQualitySuggestionImageUrl(url: string | undefined) {
  if (!url) return undefined

  try {
    const parsed = new URL(url)

    if (parsed.hostname === 'upload.wikimedia.org' && parsed.pathname.includes('/thumb/')) {
      const parts = parsed.pathname.split('/')
      const fileName = parts.at(-1)
      if (fileName) {
        parts[parts.length - 1] = `1200px-${fileName.replace(/^\d+px-/, '')}`
        parsed.pathname = parts.join('/')
        return parsed.toString()
      }
    }

    if (parsed.hostname.endsWith('static.wikia.nocookie.net')) {
      parsed.pathname = parsed.pathname.replace(/\/scale-to-width-down\/\d+/i, '/scale-to-width-down/1200')
      return parsed.toString()
    }

    if (parsed.hostname.includes('myanimelist.net')) {
      parsed.pathname = parsed.pathname.replace(/\/r\/\d+x\d+\//i, '/')
      return parsed.toString()
    }
  } catch (_error) {
    return url
  }

  return url
}
