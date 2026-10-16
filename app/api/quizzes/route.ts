import { NextResponse } from 'next/server';
import { listQuizzes } from '@/lib/admin-studio';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    quizzes: listQuizzes().map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        choices: question.choices,
      })),
    })),
  });
}
