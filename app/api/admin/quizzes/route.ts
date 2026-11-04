import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { mentorCourseScope, inScope, outOfScope } from '@/lib/mentor-scope';
import { deleteQuiz, listAttempts, listQuizzes, saveQuiz } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';

// Admins and mentors manage lesson quizzes.
async function payload() {
  const scope = await mentorCourseScope();
  const [allQuizzes, allAttempts] = await Promise.all([listQuizzes(), listAttempts()]);
  const quizzes = allQuizzes.filter((item) => inScope(scope, item.courseId));
  const attempts = allAttempts.filter((item) => inScope(scope, item.courseId));
  const stats = Object.fromEntries(quizzes.map((quiz) => {
    const mine = attempts.filter((attempt) => attempt.quizId === quiz.id);
    const average = mine.length ? Math.round(mine.reduce((sum, attempt) => sum + attempt.percent, 0) / mine.length) : null;
    return [quiz.id, { attempts: mine.length, average, passed: mine.filter((attempt) => attempt.passed).length }];
  }));
  return { success: true, quizzes, stats };
}

export async function GET() {
  const denied = await requireAdmin('Quizzes');
  if (denied) return denied;
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Quizzes');
  if (denied) return denied;
  try {
    const body = await request.json();
    const scope = await mentorCourseScope();
    const existing = (await listQuizzes()).find((item) => item.id === body.id);
    if (!inScope(scope, String(existing?.courseId || body.courseId || '')) || (existing && body.courseId && !inScope(scope, String(body.courseId)))) return NextResponse.json(outOfScope(), { status: 403 });
    if (body.action === 'delete') await deleteQuiz(String(body.id || ''));
    else await saveQuiz(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the quiz.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
