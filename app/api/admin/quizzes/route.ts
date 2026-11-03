import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
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
  const denied = await requireAdmin('Quizzes');
  if (denied) return denied;
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdmin('Quizzes');
  if (denied) return denied;
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
