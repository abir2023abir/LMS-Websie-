import { NextResponse } from 'next/server';
import { checkPassword, profileByEmail, publicProfile } from '@/lib/accounts';
import { setUserSession } from '@/lib/user-session';
import { attemptsLeftMessage, clientIp, loginFailed, loginLocked, loginSucceeded } from '@/lib/login-limit';

export const dynamic = 'force-dynamic';

const ATTEMPTS_KEY = 'user-login-attempts';

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const locked = await loginLocked(ATTEMPTS_KEY, ip);
    if (locked) return NextResponse.json({ success: false, code: 'auth/too-many-requests', message: locked }, { status: 429 });

    const body = await request.json();
    const email = String(body.email || '');
    const password = String(body.password || '');
    const profile = email && password ? await profileByEmail(email) : null;

    if (!profile || !checkPassword(password, profile.password_hash)) {
      const left = await loginFailed(ATTEMPTS_KEY, ip);
      return NextResponse.json(
        { success: false, code: left > 0 ? 'auth/invalid-credential' : 'auth/too-many-requests', message: attemptsLeftMessage(left, 'Invalid email or password.') },
        { status: left > 0 ? 401 : 429 }
      );
    }
    if (profile.disabled) {
      return NextResponse.json({ success: false, code: 'auth/user-disabled', message: 'This account is turned off.' }, { status: 403 });
    }

    await loginSucceeded(ATTEMPTS_KEY, ip);
    const response = NextResponse.json({ success: true, profile: publicProfile(profile) });
    setUserSession(response, profile.id);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Login failed.' }, { status: 500 });
  }
}
