import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteQuiz, listQuizzes, saveQuiz, type QuizQuestion } from '@/lib/admin-studio';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, quizzes: listQuizzes() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      deleteQuiz(String(body.id || ''));
      return NextResponse.json({ success: true, quizzes: listQuizzes() });
    }
    const quiz = saveQuiz({
      id: body.id ? String(body.id) : undefined,
      title: String(body.title || ''),
      questions: (Array.isArray(body.questions) ? body.questions : []) as QuizQuestion[],
    });
    return NextResponse.json({ success: true, quiz, quizzes: listQuizzes() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the quiz.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
