import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { listProfiles } from '@/lib/accounts';
import { allEnrollments } from '@/lib/payments';
import { deleteLiveClass, listLiveClasses, saveLiveClass, setAttendance } from '@/lib/live-classes';

export const dynamic = 'force-dynamic';

async function payload() {
  const [classes, enrollments, profiles] = await Promise.all([listLiveClasses(), allEnrollments(), listProfiles()]);
  // Enrolled students per course, for the attendance list.
  const roster: Record<string, { id: string; name: string; email: string }[]> = {};
  for (const [studentId, courses] of Object.entries(enrollments)) {
    const profile = profiles.find((item) => item.id === studentId);
    if (!profile) continue;
    for (const courseId of courses) {
      if (!roster[courseId]) roster[courseId] = [];
      roster[courseId].push({ id: profile.id, name: profile.name, email: profile.email });
    }
  }
  return { success: true, classes, roster };
}

// Admins and mentors schedule live classes and mark attendance.
export async function GET() {
  if (!(await staffIdentity())) return staffDenied();
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  if (!(await staffIdentity())) return staffDenied();
  try {
    const body = await request.json();
    if (body.action === 'delete') await deleteLiveClass(String(body.id || ''));
    else if (body.action === 'attendance') await setAttendance(String(body.id || ''), Array.isArray(body.studentIds) ? body.studentIds : []);
    else await saveLiveClass(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
