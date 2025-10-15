import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function adminAuthMiddleware(request: NextRequest) {
  // Check for admin token
  const adminToken = request.cookies.get('adminAuthToken')?.value;
  const adminRefreshToken = request.cookies.get('adminRefreshToken')?.value;

  if (!adminToken) {
    if (adminRefreshToken) {
      // Try to refresh the token
      const response = await fetch(`${request.nextUrl.origin}/api/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `adminRefreshToken=${adminRefreshToken}`,
        },
      });

      if (response.ok) {
        // Forward the request with the new token
        const newRequest = new Request(request.url, {
          headers: request.headers,
          method: request.method,
          body: request.body,
          redirect: request.redirect,
          signal: request.signal,
        });

        // Copy cookies from refresh response
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
          newRequest.headers.set('cookie', cookies);
        }

        return NextResponse.next({
          request: newRequest,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify admin token
  const tokenResult = verifyJWT(adminToken);
  if (!tokenResult.isValid || !tokenResult.payload || tokenResult.payload.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Invalid or insufficient permissions' },
      { status: 403 }
    );
  }

  // Add user info to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', tokenResult.payload.id);
  requestHeaders.set('x-user-email', tokenResult.payload.email);
  requestHeaders.set('x-user-role', tokenResult.payload.role);
  if (tokenResult.payload.name) {
    requestHeaders.set('x-user-name', tokenResult.payload.name);
  }
  if (tokenResult.payload.image) {
    requestHeaders.set('x-user-image', tokenResult.payload.image);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}