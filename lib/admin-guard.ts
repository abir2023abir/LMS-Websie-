import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-server';

export function requireAdmin() {
  const ok = verifyAdminSession(cookies().get('admin_session')?.value);
  if (!ok) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  return null;
}
