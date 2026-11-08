import { NextResponse } from 'next/server';
import { checkPassword, hashPassword, profileByEmail, publicProfile } from '@/lib/accounts';
import { setUserSession } from '@/lib/user-session';
import { attemptsLeftMessage, clientIp, loginFailed, loginLocked, loginSucceeded } from '@/lib/login-limit';

export const dynamic = 'force-dynamic';

const ATTEMPTS_KEY = 'user-login-attempts';
const ACCOUNT_KEY = 'user-login-by-account';
// Wrong passwords for an unknown email cost the same time as for a real one.
const DUMMY_HASH = hashPassword('not-a-real-password');

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const locked = await loginLocked(ATTEMPTS_KEY, ip);
    if (locked) return NextResponse.json({ success: false, code: 'auth/too-many-requests', message: locked }, { status: 429 });

    const body = await request.json();
    const email = String(body.email || '').slice(0, 200);
    const password = String(body.password || '').slice(0, 200);
    // A second lock per account, so changing the address does not give a guesser fresh tries.
    const account = email.trim().toLowerCase() || 'empty';
    const accountLocked = await loginLocked(ACCOUNT_KEY, account);
    if (accountLocked) return NextResponse.json({ success: false, code: 'auth/too-many-requests', message: accountLocked }, { status: 429 });
    const profile = email && password ? await profileByEmail(email) : null;

    const passwordOk = checkPassword(password, profile ? profile.password_hash : DUMMY_HASH);
    if (!profile || !passwordOk) {
      await loginFailed(ACCOUNT_KEY, account);
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
    await loginSucceeded(ACCOUNT_KEY, account);
    const response = NextResponse.json({ success: true, profile: publicProfile(profile) });
    setUserSession(response, profile.id);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Login failed.' }, { status: 500 });
  }
}
