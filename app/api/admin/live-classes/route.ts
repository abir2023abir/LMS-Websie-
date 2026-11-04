import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { listProfiles } from '@/lib/accounts';
import { allEnrollments } from '@/lib/payments';
import { mentorCourseScope, inScope, outOfScope } from '@/lib/mentor-scope';
import { deleteLiveClass, listLiveClasses, saveLiveClass, setAttendance } from '@/lib/live-classes';

export const dynamic = 'force-dynamic';

async function payload() {
  const scope = await mentorCourseScope();
  const [allClasses, enrollments, profiles] = await Promise.all([listLiveClasses(), allEnrollments(), listProfiles()]);
  const classes = allClasses.filter((item) => inScope(scope, item.courseId));
  // Enrolled students per course, for the attendance list.
  const roster: Record<string, { id: string; name: string; email: string }[]> = {};
  for (const [studentId, courses] of Object.entries(enrollments)) {
    const profile = profiles.find((item) => item.id === studentId);
    if (!profile) continue;
    for (const courseId of courses) {
      if (!inScope(scope, courseId)) continue;
      if (!roster[courseId]) roster[courseId] = [];
      roster[courseId].push({ id: profile.id, name: profile.name, email: profile.email });
    }
  }
  return { success: true, classes, roster };
}

// Admins and mentors schedule live classes and mark attendance.
export async function GET() {
  const denied = await requireAdmin('Live Classes');
  if (denied) return denied;
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Live Classes');
  if (denied) return denied;
  try {
    const body = await request.json();
    const scope = await mentorCourseScope();
    const existing = (await listLiveClasses()).find((item) => item.id === body.id);
    if (!inScope(scope, String(existing?.courseId || body.courseId || '')) || (existing && body.courseId && !inScope(scope, String(body.courseId)))) return NextResponse.json(outOfScope(), { status: 403 });
    if (body.action === 'delete') await deleteLiveClass(String(body.id || ''));
    else if (body.action === 'attendance') await setAttendance(String(body.id || ''), Array.isArray(body.studentIds) ? body.studentIds : []);
    else await saveLiveClass(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
