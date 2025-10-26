import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, TokenValidationResult, getAuthToken } from './src/lib/auth';

// Helper function to generate random bytes using Web Crypto API
const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// --- 1. CENTRALIZED SECURITY CONFIGURATION ---
const SECURITY_CONFIG = {
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  COOKIE: {
    AUTH: 'auth-token',
    REFRESH: 'refresh-token',
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'strict' as const,
    AUTH_MAX_AGE: 15 * 60, // 15 minutes for access token
    REFRESH_MAX_AGE: 7 * 24 * 60 * 60, // 7 days for refresh token
  },
  HEADERS: {
    USER_ID: 'x-user-id',
    USER_EMAIL: 'x-user-email',
    USER_ROLE: 'x-user-role',
    REQUEST_ID: 'x-request-id',
    NONCE: 'x-nonce',
  },
  SESSION: {
    MAX_CONCURRENT: 3,
  },
  ROLE_HIERARCHY: {
    GUEST: 0,
    USER: 1,
    EDITOR: 2,
    ADMIN: 3,
  },
} as const;

// --- 2. DYNAMIC REDIS CLIENT INITIALIZATION ---
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;

  try {
    const Redis = (await import('ioredis')).default;
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));
    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error('FATAL: Could not connect to Redis. Rate limiting and session management will be disabled.', error);
    redisClient = null;
    return null;
  }
}

// --- 3. ROUTE PATTERNS ---
const ROUTES = {
  PUBLIC: [
    /^\/$/,
    /^\/login$/,
    /^\/register$/,
    /^\/about$/,
    /^\/contact$/,
    /^\/articles?\/[^/]+$/,
    /^\/api\/auth\/(login|register|forgot-password)$/,
    /^\/api\/articles(\?.*)?$/,
    /^\/public\/.+$/,
  ],
  PROTECTED: {
    admin: [
      /^\/admin\/.+$/,
      /^\/api\/admin\/.+$/,
    ],
    editor: [
      /^\/editor\/.+$/,
      /^\/api\/editor\/.+$/,
    ],
    user: [
      /^\/profile$/,
      /^\/dashboard$/,
      /^\/api\/(profile|dashboard)\/.+$/,
      /^\/api\/comments\/.+$/,
    ],
  },
} as const;

type Role = keyof typeof SECURITY_CONFIG.ROLE_HIERARCHY;
type RouteType = 'public' | 'admin' | 'editor' | 'user';

// --- 4. HELPER FUNCTIONS ---

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// --- 5. SECURITY MECHANISMS ---

async function isRateLimited(clientIP: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;
  const key = `rate_limit:${clientIP}`;
  const attempts = await client.incr(key);
  if (attempts === 1) {
    await client.expire(key, SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS / 1000);
  }
  return attempts > SECURITY_CONFIG.RATE_LIMIT.MAX_ATTEMPTS;
}

function getRouteSecurityContext(pathname: string): { isPublic: boolean; routeType: RouteType; requiredRole: Role } {
  const normalizedPath = pathname.toLowerCase();

  for (const pattern of ROUTES.PUBLIC) {
    if (pattern.test(normalizedPath)) return { isPublic: true, routeType: 'public', requiredRole: 'GUEST' };
  }

  for (const [role, patterns] of Object.entries(ROUTES.PROTECTED)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedPath)) {
        return { isPublic: false, routeType: role as RouteType, requiredRole: role.toUpperCase() as Role };
      }
    }
  }

  return { isPublic: false, routeType: 'user', requiredRole: 'USER' };
}

function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const userLevel = SECURITY_CONFIG.ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = SECURITY_CONFIG.ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

function getLoginRedirectUrl(): string {
  return '/login';
}

function getRoleRedirectUrl(role: Role): string {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard';
    case 'EDITOR': return '/editor/dashboard';
    case 'USER': return '/dashboard';
    default: return '/profile';
  }
}

// --- 6. SECURITY HEADERS & AUDIT LOGGING ---

function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV === 'development';

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(SECURITY_CONFIG.HEADERS.NONCE, nonce);

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ];
  response.headers.set('Content-Security-Policy', csp.join('; '));
  
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

function auditLog(event: string, details: Record<string, any>, level: 'info' | 'warn' | 'error' = 'info'): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    ...details,
  };
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT-${level.toUpperCase()}] ${event}:`, JSON.stringify(logEntry, null, 2));
  }
}

// --- 7. MAIN MIDDLEWARE LOGIC ---

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isPublic, routeType, requiredRole } = getRouteSecurityContext(pathname);
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // A. Rate Limiting for Auth Endpoints
  if (pathname.startsWith('/api/auth/login') && request.method === 'POST') {
    if (await isRateLimited(clientIP)) {
      auditLog('RATE_LIMIT_EXCEEDED', { ip: clientIP, pathname, userAgent, requestId }, 'warn');
      return NextResponse.json({ success: false, error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
  }

  // B. Extract Tokens
  const authToken = request.cookies.get(SECURITY_CONFIG.COOKIE.AUTH)?.value;
  const refreshToken = request.cookies.get(SECURITY_CONFIG.COOKIE.REFRESH)?.value;

  // C. Handle Public Routes
  if (isPublic) {
    // Redirect authenticated users away from auth pages
    if (authToken && ['/login', '/register'].some(p => pathname.startsWith(p))) {
      const result: TokenValidationResult = verifyJWT(authToken);
      if (result.isValid && result.payload) {
        auditLog('AUTHENTICATED_USER_REDIRECT', { userId: result.payload.id, fromPath: pathname, requestId });
        const response = NextResponse.redirect(new URL(getRoleRedirectUrl(result.payload.role as Role), request.url));
        return addSecurityHeaders(response, request);
      }
    }
    const response = NextResponse.next();
    return addSecurityHeaders(response, request);
  }

  // D. Handle Protected Routes
  const token = getAuthToken(request);
  
  if (!token) {
    auditLog('UNAUTHORIZED_ACCESS_NO_TOKEN', { ip: clientIP, pathname, routeType, requestId }, 'warn');
    const response = NextResponse.redirect(new URL(getLoginRedirectUrl(), request.url));
    return addSecurityHeaders(response, request);
  }

  const verificationResult: TokenValidationResult = verifyJWT(token);

  if (!verificationResult.isValid || !verificationResult.payload) {
    // E. Handle Expired/Invalid Token
    if (refreshToken && verificationResult.errorType === 'expired') {
      auditLog('TOKEN_REFRESH_REDIRECT', { pathname, routeType, requestId });
      const response = NextResponse.redirect(new URL(`/api/auth/refresh?redirect=${encodeURIComponent(pathname)}`, request.url));
      return addSecurityHeaders(response, request);
    }

    auditLog('UNAUTHORIZED_ACCESS_INVALID_TOKEN', { ip: clientIP, pathname, error: verificationResult.error, requestId }, 'warn');
    const response = NextResponse.redirect(new URL(`${getLoginRedirectUrl()}?expired=true`, request.url));
    response.cookies.delete(SECURITY_CONFIG.COOKIE.AUTH);
    return addSecurityHeaders(response, request);
  }

  const user = verificationResult.payload;
  const userRole = user.role as Role;

  // F. Authorization Check
  if (!hasPermission(userRole, requiredRole)) {
    auditLog('INSUFFICIENT_PERMISSIONS', { userId: user.id, userRole, requiredRole, pathname, requestId }, 'warn');
    const response = NextResponse.redirect(new URL(getRoleRedirectUrl(userRole), request.url));
    return addSecurityHeaders(response, request);
  }

  // G. Add User Context to API Requests
  let response = NextResponse.next();
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SECURITY_CONFIG.HEADERS.USER_ID, user.id);
    requestHeaders.set(SECURITY_CONFIG.HEADERS.USER_EMAIL, user.email);
    requestHeaders.set(SECURITY_CONFIG.HEADERS.USER_ROLE, userRole);
    requestHeaders.set(SECURITY_CONFIG.HEADERS.REQUEST_ID, requestId);
    requestHeaders.set('x-auth-token', token);

    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  auditLog('AUTHORIZED_ACCESS', { userId: user.id, userRole, pathname, requestId });
  return addSecurityHeaders(response, request);
}

// --- 8. CONFIGURATION ---
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};