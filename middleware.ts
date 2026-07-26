import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — Route protection layer.
 *
 * This runs at the edge before the page renders.
 * It checks for the Better Auth session cookie and redirects
 * unauthenticated users away from protected routes.
 *
 * NOTE: This is a first-pass check. Each API route still verifies
 * the session server-side — this middleware just prevents
 * unauthenticated users from even loading the page shell.
 */

const PROTECTED_ROUTES = ['/dashboard', '/admin', '/volunteer'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth stores session in a cookie named "better-auth.session_token"
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  const isAuthenticated = !!sessionToken;

  // ── Redirect unauthenticated users from protected routes ──
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Redirect authenticated users away from auth routes ──
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ── Security headers on all responses ──
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
