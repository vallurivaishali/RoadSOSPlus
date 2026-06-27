/**
 * Next.js Middleware — Route Protection & RBAC
 *
 * Runs on the Edge Runtime before any page renders.
 * Guards:
 *   /citizen/*  → requires authenticated user with role='citizen'
 *   /authority/* → requires authenticated user with role='authority'
 *
 * Token validation: we decode the JWT locally (without DB call) to check
 * role and expiry. The backend re-validates on every API call, so this is
 * a UX guard — not a security boundary.
 */
import { NextRequest, NextResponse } from 'next/server'

// Lightweight JWT decoder (no signature verification — edge runtime constraint)
function decodeJWT(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

function isTokenExpired(exp: number): boolean {
  return Date.now() >= exp * 1000
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Grab token from Authorization header (set by client) or cookie
  const token =
    request.cookies.get('roadsos_token')?.value ||
    request.headers.get('x-auth-token') ||
    null

  const isCitizenRoute = pathname.startsWith('/citizen')
  const isAuthorityRoute = pathname.startsWith('/authority')

  if (!isCitizenRoute && !isAuthorityRoute) {
    return NextResponse.next()
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const payload = decodeJWT(token)

  // Invalid or expired token → redirect to login
  if (!payload || isTokenExpired(payload.exp)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Wrong role → redirect to their correct dashboard
  if (isCitizenRoute && payload.role !== 'citizen') {
    return NextResponse.redirect(new URL('/authority', request.url))
  }

  if (isAuthorityRoute && payload.role !== 'authority') {
    return NextResponse.redirect(new URL('/citizen', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/citizen/:path*', '/authority/:path*'],
}
