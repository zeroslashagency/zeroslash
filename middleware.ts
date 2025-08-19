import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Enforce HTTPS in production. Honors x-forwarded-proto on platforms like Vercel/NGINX.
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')
    if (proto !== 'https') {
      const url = req.nextUrl
      url.protocol = 'https'
      return NextResponse.redirect(url, 308)
    }
  }

  // Redirect /careers -> /waitlist
  const { pathname } = req.nextUrl
  if (pathname === '/careers') {
    const url = req.nextUrl.clone()
    url.pathname = '/waitlist'
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

// Exclude static assets and well-known files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\.well-known).*)'],
}
