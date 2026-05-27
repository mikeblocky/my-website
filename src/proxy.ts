import { NextResponse, type NextRequest } from 'next/server'

const NO_STORE =
  'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, no-transform'

function isDocumentOrRouterPayload(request: NextRequest) {
  const accept = request.headers.get('accept') || ''

  return (
    accept.includes('text/html') ||
    request.headers.has('rsc') ||
    request.headers.has('next-router-prefetch') ||
    request.headers.has('next-router-state-tree') ||
    request.nextUrl.searchParams.has('_rsc')
  )
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  if (isDocumentOrRouterPayload(request)) {
    response.headers.set('Cache-Control', NO_STORE)
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|icon.png|apple-icon.png|sw.js).*)'],
}
