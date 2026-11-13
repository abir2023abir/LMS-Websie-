import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createProfile, profileByEmail } from '@/lib/accounts';
import { googleProfileFromCode } from '@/lib/google-oauth';
import { homeForRole } from '@/lib/roles';
import { rateLimited } from '@/lib/rate-limit';
import { setUserSession } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

function fail(origin: string, reason: string) {
  const response = NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  response.cookies.delete('google_oauth');
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (rateLimited(request, 'google-callback', 20, 15 * 60 * 1000)) return fail(url.origin, 'google-failed');
  if (url.searchParams.get('error')) return fail(url.origin, 'google-denied');

  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const raw = request.headers.get('cookie') || '';
  const cookie = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith('google_oauth='));
  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(decodeURIComponent((cookie || '').slice('google_oauth='.length)));
  } catch {
    saved = {};
  }
  if (!code || !state || !saved.state || saved.state !== state) return fail(url.origin, 'google-failed');

  try {
    const google = await googleProfileFromCode(url.origin, code);
    let profile = await profileByEmail(google.email);
    if (profile?.disabled) return fail(url.origin, 'google-failed');
    if (!profile) {
      profile = await createProfile({
        email: google.email,
        name: google.name,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'Student',
      });
    }
    const next = saved.next && saved.next.startsWith('/') && !saved.next.startsWith('//') ? saved.next : homeForRole(profile.active_role);
    const response = NextResponse.redirect(new URL(next, url.origin));
    setUserSession(response, profile.id);
    response.cookies.delete('google_oauth');
    return response;
  } catch {
    return fail(url.origin, 'google-failed');
  }
}
