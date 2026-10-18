import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/user-session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearUserSession(response);
  return response;
}
