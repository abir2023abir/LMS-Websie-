import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { courseAnalytics, staffCourses } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

// Progress analytics for one course (admins: any course; mentors: their own courses).
export async function GET(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course.' }, { status: 400 });
  const allowed = await staffCourses(staff);
  if (allowed && !allowed.has(courseId)) return staffDenied();
  return NextResponse.json({ success: true, allowedCourses: allowed ? [...allowed] : null, ...(await courseAnalytics(courseId)) });
}
