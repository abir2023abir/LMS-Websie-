import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { mentorCourseScope, inScope, outOfScope } from '@/lib/mentor-scope';
import { attemptsFor, deleteExam, listExams, saveExam } from '@/lib/exams';

export const dynamic = 'force-dynamic';

async function payload() {
  const scope = await mentorCourseScope();
  const [exams, attempts] = await Promise.all([listExams(), attemptsFor()]);
  return { success: true, exams: exams.filter((item) => inScope(scope, item.courseId)), attempts: attempts.filter((item) => inScope(scope, item.courseId)) };
}

// Admins and mentors create exams and see every student's result.
export async function GET() {
  const denied = await requireAdmin('Exams');
  if (denied) return denied;
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Exams');
  if (denied) return denied;
  try {
    const body = await request.json();
    const scope = await mentorCourseScope();
    const existing = (await listExams()).find((item) => item.id === body.id);
    if (!inScope(scope, String(existing?.courseId || body.courseId || '')) || (existing && body.courseId && !inScope(scope, String(body.courseId)))) return NextResponse.json(outOfScope(), { status: 403 });
    if (body.action === 'delete') await deleteExam(String(body.id || ''));
    else await saveExam(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the exam.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
