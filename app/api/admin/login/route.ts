import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminCookieOptions, signAdminSession } from '@/lib/auth-server';
import { attemptsLeftMessage, clientIp, loginFailed, loginLocked, loginSucceeded } from '@/lib/login-limit';

// Credentials come only from the environment; without them admin sign-in stays closed.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET_SET = Boolean(process.env.ADMIN_JWT_SECRET);
const ATTEMPTS_KEY = 'admin-login-attempts';

function sameText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  try {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SECRET_SET) {
      return NextResponse.json({ success: false, message: 'Admin sign-in is not configured.' }, { status: 503 });
    }

    const ip = clientIp(request);
    const locked = await loginLocked(ATTEMPTS_KEY, ip);
    if (locked) return NextResponse.json({ success: false, message: locked }, { status: 429 });

    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    // Check both fields every time so timing does not reveal which one was wrong
    const userOk = sameText(username, ADMIN_USERNAME);
    const passOk = sameText(password, ADMIN_PASSWORD);
    if (!userOk || !passOk) {
      const left = await loginFailed(ATTEMPTS_KEY, ip);
      return NextResponse.json(
        { success: false, message: attemptsLeftMessage(left, 'Invalid username or password.') },
        { status: left > 0 ? 401 : 429 }
      );
    }

    await loginSucceeded(ATTEMPTS_KEY, ip);

    // Set HTTP-only secure cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, signAdminSession(username), adminCookieOptions(ADMIN_SESSION_SECONDS));
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
