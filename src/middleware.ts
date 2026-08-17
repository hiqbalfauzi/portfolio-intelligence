import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-intelligence-secret-key-change-in-production'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip Next.js internal paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Read token from cookies
  const token = request.cookies.get('pi_token')?.value

  // Public routes
  const publicPaths = ['/login', '/register']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // API auth routes - skip middleware
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // If no token and not public path, redirect to login
  if (!token) {
    if (isPublicPath) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token using jose (edge-compatible JWT library)
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    
    // Check if payload has required fields
    if (!payload.userId || !payload.email) {
      throw new Error('Invalid token payload')
    }

    // If logged in and trying to access login/register, redirect to dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('pi_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
