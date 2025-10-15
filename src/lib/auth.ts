// --- 5. CENTRALIZED TOKEN EXTRACTION ---
/**
 * Extracts JWT token from Authorization header (Bearer) or cookies (authToken, adminAuthToken, editorAuthToken).
 * Usage: getAuthToken(request)
 */
export function getAuthToken(request: any): string | null {
  if (request?.cookies?.get) {
    return request.cookies.get('auth-token')?.value || null;
  }

  const cookieHeader = request?.headers?.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});

  return cookies['auth-token'] || null;
}
import jwt from 'jsonwebtoken';

// --- 1. SECURITY CONFIGURATION ---
// Simplified for a single token system with access/refresh token support
const SECURITY_CONFIG = {
  JWT: {
    ALGORITHM: 'HS256' as const,
    ISSUER: 'news-portal',
    AUDIENCE: 'news-portal-users',
    ACCESS_EXPIRES_IN: '15m', // Short-lived access token
    REFRESH_EXPIRES_IN: '7d', // Long-lived refresh token
    MIN_SECRET_LENGTH: 64,
    CLOCK_TOLERANCE: 30, // seconds
  },
} as const;

// --- 2. JWT SECRET VALIDATION ---
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is not configured');
}

if (JWT_SECRET.length < SECURITY_CONFIG.JWT.MIN_SECRET_LENGTH) {
  throw new Error(
    `CRITICAL: JWT_SECRET must be at least ${SECURITY_CONFIG.JWT.MIN_SECRET_LENGTH} characters long`
  );
}

// --- 3. INTERFACES ---
import type { JWTPayload } from './types/auth';

export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
  errorType?: 'expired' | 'invalid' | 'malformed';
}

// --- 4. CORE JWT FUNCTIONS ---

/**
 * Creates a signed JWT token for an access or refresh token.
 * The role is included as a standard claim.
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string): string {
  try {
    if (!payload.id || !payload.email || !payload.role) {
      throw new Error('Missing required payload fields (id, email, role)');
    }

    // Define options explicitly to avoid type inference issues
    const options: jwt.SignOptions = {
      algorithm: SECURITY_CONFIG.JWT.ALGORITHM,
      expiresIn: expiresIn as any,// This is the line that was causing the error
      issuer: SECURITY_CONFIG.JWT.ISSUER,
      audience: SECURITY_CONFIG.JWT.AUDIENCE,
    };

    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      JWT_SECRET!,
      options // Pass the explicitly typed options object
    );
  } catch (error) {
    console.error('JWT signing failure:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Authentication token generation failed');
  }
}

/**
 * Verifies a JWT token and validates its structure.
 * No longer needs to check for a specific 'tokenType'.
 */
export function verifyJWT(token: string): TokenValidationResult {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Invalid token format', errorType: 'malformed' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: [SECURITY_CONFIG.JWT.ALGORITHM],
      issuer: SECURITY_CONFIG.JWT.ISSUER,
      audience: SECURITY_CONFIG.JWT.AUDIENCE,
      clockTolerance: SECURITY_CONFIG.JWT.CLOCK_TOLERANCE,
    }) as jwt.JwtPayload & JWTPayload;

    // Validate required fields
    if (!decoded.id || !decoded.email || !decoded.role) {
      return { isValid: false, error: 'Token missing required fields', errorType: 'invalid' };
    }

    // Validate role
    const validRoles = ['ADMIN', 'EDITOR', 'USER'];
    if (!validRoles.includes(decoded.role)) {
      return { isValid: false, error: 'Invalid role in token', errorType: 'invalid' };
    }

    return {
      isValid: true,
      payload: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role as 'USER' | 'EDITOR' | 'ADMIN',
      },
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, error: 'Token expired', errorType: 'expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { isValid: false, error: 'Invalid token', errorType: 'invalid' };
    }
    return { isValid: false, error: 'Token verification failed', errorType: 'invalid' };
  }
}

// --- 5. HELPER FUNCTIONS ---

/**
 * Safely parses a JWT without verifying its signature.
 * WARNING: For non-security-critical operations ONLY (e.g., extracting a user ID from an expired token).
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    const parsed = JSON.parse(payload);

    if (!parsed.id || !parsed.email || !parsed.role) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validates if a string has the structure of a JWT.
 */
export function isValidTokenFormat(token: unknown): token is string {
  return (
    typeof token === 'string' &&
    token.split('.').length === 3 &&
    token.split('.').every(part => part.length > 0)
  );
}

/**
 * Extracts and sanitizes a display name from an email address.
 */
export function extractNameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return "Guest";
  try {
    const [username] = email.split("@");
    if (!username) return "Guest";
    const sanitized = username.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    return sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();
  } catch {
    return "Guest";
  }
}

// --- 6. CONSTANTS FOR EASY IMPORTING ---
// Export the expiration times so API routes can use them
export const ACCESS_TOKEN_EXPIRES_IN = SECURITY_CONFIG.JWT.ACCESS_EXPIRES_IN;
export const REFRESH_TOKEN_EXPIRES_IN = SECURITY_CONFIG.JWT.REFRESH_EXPIRES_IN;