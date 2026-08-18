import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'lms_secure_admin_jwt_secret_dev_fallback_2026';

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
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
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
  return jwt.sign(
    {
      username,
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
