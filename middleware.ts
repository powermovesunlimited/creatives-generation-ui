import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const protectedRoutes = ['/ad-gallery', '/ad-results']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    // Redirect to login page if not authenticated
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect from / to /ad-gallery if authenticated
  if (req.nextUrl.pathname === '/' && session) {
    const redirectUrl = new URL('/ad-gallery', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}