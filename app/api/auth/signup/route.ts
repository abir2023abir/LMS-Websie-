import { NextResponse } from 'next/server';
import { ROLES, createProfile, profileByEmail, publicProfile, requestGuardianLink, type Role } from '@/lib/accounts';
import { setUserSession } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    const role = body.role as Role;
    const studentEmail = String(body.linkedStudentEmail || '').trim();

    if (!name) return NextResponse.json({ success: false, message: 'Please enter your full name.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, code: 'auth/invalid-email', message: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, code: 'auth/weak-password', message: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (!ROLES.includes(role)) return NextResponse.json({ success: false, message: 'Pick a role.' }, { status: 400 });
    if (role === 'Guardian' && !studentEmail) {
      return NextResponse.json({ success: false, message: 'Enter the email of the student this guardian is linked to.' }, { status: 400 });
    }

    if (await profileByEmail(email)) {
      return NextResponse.json(
        { success: false, code: 'auth/email-already-in-use', message: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const profile = await createProfile({ email, name, password, role });
    if (role === 'Guardian') await requestGuardianLink(profile.id, studentEmail);

    const response = NextResponse.json({ success: true, profile: publicProfile(profile) });
    setUserSession(response, profile.id);
    return response;
  } catch (error: any) {
    const duplicate = error.message === 'duplicate';
    return NextResponse.json(
      {
        success: false,
        code: duplicate ? 'auth/email-already-in-use' : undefined,
        message: duplicate ? 'An account with this email already exists.' : error.message || 'Could not create the account.',
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}
