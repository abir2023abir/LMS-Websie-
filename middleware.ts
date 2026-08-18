import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session');

    // If no session cookie, rewrite the URL to /admin but render login
    // The /admin page.tsx handles the rendering decision server-side
    // We just ensure the request flows to /admin/page.tsx with a flag
    if (!adminSession) {
      // Let the /admin page render itself (it shows login form when no cookie)
      return NextResponse.next();
    }

    // Has session cookie - let through
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
