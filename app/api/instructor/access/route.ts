import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-server';
import { everyPanelTab, tabsForInstructor } from '@/lib/instructor-access';
import { currentProfile } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (verifyAdminSession(cookies().get('admin_session')?.value)) {
    return NextResponse.json({ success: true, admin: true, tabs: everyPanelTab() });
  }
  const profile = await currentProfile();
  if (!profile || !profile.roles.includes('Instructor')) {
    return NextResponse.json({ success: false, message: 'Instructor sign-in required.' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    admin: false,
    email: profile.email,
    name: profile.name,
    tabs: await tabsForInstructor(profile.email),
  });
}
