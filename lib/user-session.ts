import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { profileById, type MentorLevel, type Profile, type Role } from '@/lib/accounts';
import { verifyAdminSession } from '@/lib/auth-server';

// No fallback secret: without ADMIN_JWT_SECRET user sessions are neither issued nor accepted.
const BASE_SECRET = process.env.ADMIN_JWT_SECRET || '';
const SECRET = `${BASE_SECRET}:user`;
export const USER_COOKIE = 'user_session';
const MAX_AGE = 7 * 24 * 60 * 60;

export function setUserSession(response: NextResponse, profileId: string) {
  if (!BASE_SECRET) throw new Error('ADMIN_JWT_SECRET is not set');
  const token = jwt.sign({ uid: profileId }, SECRET, { expiresIn: MAX_AGE });
  response.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export function clearUserSession(response: NextResponse) {
  response.cookies.delete(USER_COOKIE);
}

export async function currentProfile(): Promise<Profile | null> {
  const token = cookies().get(USER_COOKIE)?.value;
  if (!token || !BASE_SECRET) return null;
  try {
    const { uid } = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as { uid: string };
    const profile = await profileById(uid);
    return profile && !profile.disabled ? profile : null;
  } catch {
    return null;
  }
}

type Guarded = { profile: Profile; denied: null } | { profile: null; denied: NextResponse };

export async function requireRole(role?: Role): Promise<Guarded> {
  const profile = await currentProfile();
  if (!profile) {
    return { profile: null, denied: NextResponse.json({ success: false, message: 'Please sign in.' }, { status: 401 }) };
  }
  if (role && !profile.roles.includes(role)) {
    return { profile: null, denied: NextResponse.json({ success: false, message: `This needs the ${role} role.` }, { status: 403 }) };
  }
  return { profile, denied: null };
}

export type Staff = { admin: true; level: 'admin'; who: string } | { admin: false; level: MentorLevel; who: string; profile: Profile };

// Admin (admin_session cookie) or a signed-in account with the mentor role.
export async function staffIdentity(): Promise<Staff | null> {
  if (verifyAdminSession(cookies().get('admin_session')?.value)) return { admin: true, level: 'admin', who: 'admin' };
  const profile = await currentProfile();
  if (!profile || !profile.roles.includes('Instructor')) return null;
  return { admin: false, level: profile.mentor_level || 'lead', who: profile.email, profile };
}

export function staffDenied() {
  return NextResponse.json({ success: false, message: 'Only mentors and admins can do this.' }, { status: 403 });
}
