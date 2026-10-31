import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { gradeQuiz, listQuizzes } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';

// Marks a quiz on the server (answers never reach the browser before submitting).
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const body = await request.json();
  const quiz = (await listQuizzes()).find((item) => item.id === body.id && item.published);
  if (!quiz) return NextResponse.json({ success: false, message: 'Quiz not found.' }, { status: 404 });
  if (!(await getEnrollments(profile.id)).includes(quiz.courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course to take its quizzes.' }, { status: 403 });
  }
  const answers = (body.answers && typeof body.answers === 'object' ? body.answers : {}) as Record<string, number>;
  const { attempt, results } = await gradeQuiz(quiz, profile.id, answers);
  return NextResponse.json({ success: true, correct: attempt.correct, total: attempt.total, percent: attempt.percent, passed: attempt.passed, passMark: quiz.passMark, results });
}
