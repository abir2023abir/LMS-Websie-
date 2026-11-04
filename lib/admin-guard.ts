import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-server';
import { tabsForInstructor } from '@/lib/instructor-access';
import { currentProfile } from '@/lib/user-session';

function denied(status: number, message: string) {
  return NextResponse.json({ success: false, error: message, message }, { status });
}

/** True when the request carries the admin cookie (not just a mentor account). */
export function isAdminSession() {
  return Boolean(verifyAdminSession(cookies().get('admin_session')?.value));
}

/**
 * Same as requireAdmin, for actions that change data. An assistant mentor can open
 * the tools the admin gave them but only look; leads and admins can also change things.
 */
export async function requireAdminWrite(tab?: string) {
  const blocked = await requireAdmin(tab);
  if (blocked) return blocked;
  if (isAdminSession()) return null;
  const profile = await currentProfile();
  if (profile?.mentor_level === 'assistant') {
    return denied(403, 'Assistant mentors can view this tool and reply to students, but cannot change anything here.');
  }
  return null;
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
