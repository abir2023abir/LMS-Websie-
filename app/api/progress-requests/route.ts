import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { listCourseSettings } from '@/lib/accounts';
import { getCoursesByInstructor } from '@/lib/db';
import { approveLesson, decideRequest, extendCourse, listRequests } from '@/lib/progression';

export const dynamic = 'force-dynamic';

// Courses a staff member may decide for: admins → all; mentors → courses they teach or mentor.
async function allowedCourses(staff: NonNullable<Awaited<ReturnType<typeof staffIdentity>>>) {
  if (staff.admin) return null;
  const [owned, settings] = await Promise.all([getCoursesByInstructor(staff.profile.id), listCourseSettings()]);
  return new Set([
    ...owned.map((course) => String(course.id || '')),
    ...settings.filter((row) => String(row.mentor_email || '').toLowerCase() === staff.profile.email.toLowerCase()).map((row) => row.course_id),
  ]);
}

export async function GET() {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  const allowed = await allowedCourses(staff);
  const requests = (await listRequests()).filter((item) => !allowed || allowed.has(item.courseId));
  return NextResponse.json({ success: true, requests });
}

export async function POST(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const allowed = await allowedCourses(staff);
    if (body.action === 'unlock') {
      // Manual unlock: let a student past one lesson without a request.
      if (allowed && !allowed.has(String(body.courseId))) return staffDenied();
      await approveLesson(String(body.studentId || ''), String(body.courseId || ''), String(body.lessonId || ''));
    } else if (body.action === 'extend') {
      // Manual extension: move one student's course ending date later without a request.
      if (allowed && !allowed.has(String(body.courseId))) return staffDenied();
      await extendCourse(String(body.studentId || ''), String(body.courseId || ''), Number(body.days));
    } else {
      const current = (await listRequests()).find((item) => item.id === body.id);
      if (!current) throw new Error('Request not found.');
      if (allowed && !allowed.has(current.courseId)) return staffDenied();
      await decideRequest(current.id, body.status === 'rejected' ? 'rejected' : 'approved', staff.admin ? 'Admin' : staff.profile.name || staff.who, String(body.reply || ''), Number(body.days) || 2);
    }
    const requests = (await listRequests()).filter((item) => !allowed || allowed.has(item.courseId));
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
