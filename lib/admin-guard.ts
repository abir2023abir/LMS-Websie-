import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-server';
import { tabsForInstructor } from '@/lib/instructor-access';
import { currentProfile } from '@/lib/user-session';

function denied(status: number, message: string) {
  return NextResponse.json({ success: false, error: message, message }, { status });
}

/** Admin cookie always passes. An instructor passes only for a tab the admin has opened. */
export async function requireAdmin(tab?: string) {
  if (verifyAdminSession(cookies().get('admin_session')?.value)) return null;
  if (!tab) return denied(401, 'Unauthorized');
  const profile = await currentProfile();
  if (!profile || !profile.roles.includes('Instructor')) return denied(401, 'Unauthorized');
  const tabs = await tabsForInstructor(profile.email);
  if (!tabs.includes(tab as never)) return denied(403, 'This tool is not open for your account.');
  return null;
}
