import { NextResponse } from 'next/server';
import { listQuizzes } from '@/lib/admin-studio';

export async function POST(request: Request) {
  const body = await request.json();
  const quiz = listQuizzes().find((item) => item.id === body.id);
  if (!quiz) return NextResponse.json({ success: false, message: 'Quiz not found.' }, { status: 404 });
  const answers = body.answers || {};
  const correct = quiz.questions.filter((question) => Number(answers[question.id]) === question.correctIndex).length;
  return NextResponse.json({ success: true, correct, total: quiz.questions.length });
}
