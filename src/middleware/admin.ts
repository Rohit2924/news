import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './adminAuth';

// Config object for matching paths
const adminConfig = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return adminAuthMiddleware(request);
  }

  // For all other routes, proceed normally
  return NextResponse.next();
}