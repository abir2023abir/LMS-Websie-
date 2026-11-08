import { NextResponse } from 'next/server';
import { resultById, reviewResult } from '@/lib/accounts';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { staffCourses } from '@/lib/analytics';
import { getEnrollments } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const id = String(body.id || '');
    const result = await resultById(id);
    if (!result) return NextResponse.json({ success: false, message: 'Result not found.' }, { status: 404 });
    if (!staff.admin) {
      // A mentor may only mark work of students who are enrolled in a course they teach or mentor.
      if (staff.level === 'assistant') return NextResponse.json({ success: false, message: 'Assistant mentors cannot change results.' }, { status: 403 });
      const mine = await staffCourses(staff);
      const enrolled = await getEnrollments(result.student_id);
      if (!mine || !enrolled.some((courseId) => mine.has(courseId))) return staffDenied();
    }
    await reviewResult(id, Boolean(body.passed), String(body.review || '').slice(0, 1000), staff.who);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
