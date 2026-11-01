import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { attemptsFor, examWindow, listExams, saveProgress, startAttempt, submitAttempt } from '@/lib/exams';

export const dynamic = 'force-dynamic';

// Exams from the signed-in student's enrolled courses, with their status and results.
export async function GET() {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const [exams, enrolled, mine] = await Promise.all([listExams(), getEnrollments(profile.id), attemptsFor(profile.id)]);
  return NextResponse.json({
    success: true,
    exams: exams.filter((exam) => exam.published && enrolled.includes(exam.courseId)).map((exam) => {
      const attempts = mine.filter((attempt) => attempt.examId === exam.id);
      const done = attempts.filter((attempt) => attempt.status === 'submitted');
      const best = done.length ? done.reduce((top, attempt) => (attempt.percent > top.percent ? attempt : top)) : null;
      return {
        id: exam.id, title: exam.title, description: exam.description,
        courseId: exam.courseId, courseTitle: exam.courseTitle, moduleTitle: exam.moduleTitle, lessonTitle: exam.lessonTitle,
        durationMinutes: exam.durationMinutes, opensAt: exam.opensAt, closesAt: exam.closesAt, passMark: exam.passMark,
        maxAttempts: exam.maxAttempts, questionCount: exam.questions.length,
        window: examWindow(exam),
        attemptsUsed: attempts.length,
        inProgress: attempts.some((attempt) => attempt.status === 'in-progress'),
        best: best ? { score: best.score, total: best.total, percent: best.percent, passed: best.passed } : null,
      };
    }),
  });
}

// action: start | save | submit
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const body = await request.json();
    const exam = (await listExams()).find((item) => item.id === body.examId && item.published);
    if (!exam) return NextResponse.json({ success: false, message: 'Exam not found.' }, { status: 404 });
    if (!(await getEnrollments(profile.id)).includes(exam.courseId)) {
      return NextResponse.json({ success: false, message: 'Enroll in this course to take its exams.' }, { status: 403 });
    }
    const answers = (body.answers && typeof body.answers === 'object' ? body.answers : {}) as Record<string, number>;
    if (body.action === 'start') {
      const started = await startAttempt(exam, { id: profile.id, name: profile.name || profile.email, email: profile.email });
      return NextResponse.json({ success: true, title: exam.title, durationMinutes: exam.durationMinutes, ...started });
    }
    if (body.action === 'save') {
      await saveProgress(String(body.attemptId || ''), profile.id, answers);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'submit') {
      const attempt = await submitAttempt(exam, String(body.attemptId || ''), profile.id, answers);
      return NextResponse.json({
        success: true,
        score: attempt.score, total: attempt.total, percent: attempt.percent, passed: attempt.passed, passMark: exam.passMark,
        review: exam.showAnswers ? exam.questions.map((question) => ({ id: question.id, prompt: question.prompt, choices: question.choices, correctIndex: question.correctIndex, chosen: attempt.answers[question.id] ?? -1, explanation: question.explanation })) : null,
      });
    }
    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
