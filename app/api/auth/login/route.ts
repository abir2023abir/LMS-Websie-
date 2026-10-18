import { NextResponse } from 'next/server';
import { checkPassword, profileByEmail, publicProfile } from '@/lib/accounts';
import { setUserSession } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '');
    const password = String(body.password || '');
    const profile = email && password ? await profileByEmail(email) : null;

    if (!profile || !checkPassword(password, profile.password_hash)) {
      return NextResponse.json({ success: false, code: 'auth/invalid-credential', message: 'Invalid email or password.' }, { status: 401 });
    }
    if (profile.disabled) {
      return NextResponse.json({ success: false, code: 'auth/user-disabled', message: 'This account is turned off.' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, profile: publicProfile(profile) });
    setUserSession(response, profile.id);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Login failed.' }, { status: 500 });
  }
}
