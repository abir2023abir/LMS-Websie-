import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { closeExpiredStart, endsAt, listAttempts, listQuizzes, notYetAvailable, questionsForStudent, setStart, startedAt } from '@/lib/quizzes';
import { stepOpen } from '@/lib/progression';
import { attemptLimit } from '@/lib/assessment-risk';

export const dynamic = 'force-dynamic';

// Starts (or resumes) one attempt of a timed quiz. The clock runs on the server.
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const quiz = (await listQuizzes()).find((item) => item.id === body.id && item.published);
  if (!quiz || !quiz.timeLimitMinutes) return NextResponse.json({ success: false, message: 'Quiz not found.' }, { status: 404 });
  if (!(await getEnrollments(profile.id)).includes(quiz.courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course to take its quizzes.' }, { status: 403 });
  }
  if (!(await stepOpen(profile.id, quiz.courseId, quiz.lessonId, 'quiz'))) {
    return NextResponse.json({ success: false, message: 'Finish the earlier steps of this lesson first.' }, { status: 403 });
  }
  if (notYetAvailable(quiz)) return NextResponse.json({ success: false, message: 'This quiz is not open yet.' }, { status: 403 });

  await closeExpiredStart(quiz, profile.id);
  let start = await startedAt(profile.id, quiz.id);
  if (!start) {
    const used = (await listAttempts(profile.id)).filter((item) => item.quizId === quiz.id).length;
    const limit = await attemptLimit(profile.id, 'quiz', quiz.id, quiz.maxAttempts || 0);
    if (limit && used >= limit) {
      return NextResponse.json({ success: false, message: 'You have used all your attempts for this quiz. Ask your instructor for more attempts.' }, { status: 403 });
    }
    start = Date.now();
    await setStart(profile.id, quiz.id, start);
  }
  return NextResponse.json({ success: true, questions: questionsForStudent(quiz), endsAt: new Date(endsAt(quiz, start)).toISOString(), now: new Date().toISOString() });
}
