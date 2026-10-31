import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { deleteQuiz, listAttempts, listQuizzes, saveQuiz } from '@/lib/quizzes';

export const dynamic = 'force-dynamic';

// Admins and mentors manage lesson quizzes.
async function payload() {
  const [quizzes, attempts] = await Promise.all([listQuizzes(), listAttempts()]);
  const stats = Object.fromEntries(quizzes.map((quiz) => {
    const mine = attempts.filter((attempt) => attempt.quizId === quiz.id);
    const average = mine.length ? Math.round(mine.reduce((sum, attempt) => sum + attempt.percent, 0) / mine.length) : null;
    return [quiz.id, { attempts: mine.length, average, passed: mine.filter((attempt) => attempt.passed).length }];
  }));
  return { success: true, quizzes, stats };
}

export async function GET() {
  if (!(await staffIdentity())) return staffDenied();
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  if (!(await staffIdentity())) return staffDenied();
  try {
    const body = await request.json();
    if (body.action === 'delete') await deleteQuiz(String(body.id || ''));
    else await saveQuiz(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the quiz.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
