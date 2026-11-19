import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/admin-guard';
import { demoStudent, resetDemoStudent } from '@/lib/demo-student';
import { setUserSession } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

/**
 * Admin only: open the student panel as the demo student (enrolled in every course, free).
 * The admin's own admin session stays as it is, so the admin panel keeps working in its tab.
 */
export async function GET(request: Request) {
  if (!isAdminSession()) return NextResponse.redirect(new URL('/admin', request.url));
  const profile = await demoStudent();
  const response = NextResponse.redirect(new URL('/student', request.url));
  setUserSession(response, profile.id);
  return response;
}

/** Admin only: start the demo student over (progress, answers and the timeline go back to Day 1). */
export async function DELETE() {
  if (!isAdminSession()) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await resetDemoStudent();
  return NextResponse.json({ success: true });
}
