import jwt from 'jsonwebtoken';

// No fallback: without ADMIN_JWT_SECRET no admin session can be signed or accepted.
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || '';

export const ADMIN_COOKIE = 'admin_session';
/** Admin sessions end after 12 hours; the admin signs in again after that. */
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

export interface AdminTokenPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Cryptographically verifies an admin session JWT token.
 * Returns the decoded payload if valid, or null if invalid/expired.
 */
export function verifyAdminSession(token?: string): AdminTokenPayload | null {
  if (!JWT_SECRET || !token || typeof token !== 'string') {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as AdminTokenPayload;
    if (decoded && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Signs a new admin JWT token.
 */
export function signAdminSession(username: string): string {
  if (!JWT_SECRET) throw new Error('ADMIN_JWT_SECRET is not set');
  return jwt.sign(
    {
      username,
      role: 'admin',
    },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: ADMIN_SESSION_SECONDS }
  );
}

/** Cookie options shared by sign-in and sign-out so the browser replaces the same cookie. */
export function adminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  };
}
