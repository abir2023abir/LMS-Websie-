import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth-server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Overwrite with the same path/flags and an immediate expiry so the browser drops it
  response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(0), expires: new Date(0) });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
