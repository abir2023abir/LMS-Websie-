import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { googleAuthUrl, googleConfigured } from '@/lib/google-oauth';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '';
}

export async function GET(request: Request) {
  if (rateLimited(request, 'google-start', 20, 15 * 60 * 1000)) {
    return NextResponse.json(TOO_MANY, { status: 429 });
  }
  const url = new URL(request.url);
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL('/login?error=google-not-ready', url.origin));
  }
  const state = crypto.randomBytes(24).toString('hex');
  const response = NextResponse.redirect(googleAuthUrl(url.origin, state));
  response.cookies.set('google_oauth', JSON.stringify({ state, next: safeNext(url.searchParams.get('next')) }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  });
  return response;
}
