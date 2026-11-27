/**
 * Protects every route except the sign-in page, Auth.js endpoints and robots.txt
 * (Next.js 16 "proxy", formerly middleware). Route handlers and pages re-check the session.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { authSecret, isAllowed } from '@/auth/config'

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: authSecret() })
  if (token && isAllowed(token.email)) return NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const url = request.nextUrl.clone()
  url.pathname = '/signin'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api/auth|signin|robots\\.txt|favicon\\.ico|_next/static|_next/image).*)'],
}
