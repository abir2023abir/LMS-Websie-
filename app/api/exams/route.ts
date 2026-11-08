import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { attemptsFor, examWindow, listExams, saveProgress, startAttempt, submitAttempt, type Exam } from '@/lib/exams';
import { courseLessons, finalExamOpen, stepOpen } from '@/lib/progression';
import { attemptLimit, examsRestricted } from '@/lib/assessment-risk';

// The lesson whose path an exam belongs to: its own lesson, or a module's last lesson. A course-wide (final) exam opens after every lesson.
async function gateLesson(exam: Exam) {
  if (exam.lessonId) return exam.lessonId;
  if (!exam.moduleId) return '';
  const { lessons } = await courseLessons(exam.courseId);
  return lessons.filter((lesson) => lesson.moduleId === exam.moduleId).pop()?.lessonId || '';
}

async function examLocked(studentId: string, exam: Exam) {
  const lessonId = await gateLesson(exam);
  if (!lessonId) return !(await finalExamOpen(studentId, exam.courseId));
  return !(await stepOpen(studentId, exam.courseId, lessonId, 'exam'));
}

export const dynamic = 'force-dynamic';

// Exams from the signed-in student's enrolled courses, with their status and results.
export async function GET() {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const [exams, enrolled, mine] = await Promise.all([listExams(), getEnrollments(profile.id), attemptsFor(profile.id)]);
  const visible = exams.filter((exam) => exam.published && enrolled.includes(exam.courseId));
  const [locks, limits, restricted] = await Promise.all([
    Promise.all(visible.map((exam) => examLocked(profile.id, exam))),
    Promise.all(visible.map((exam) => attemptLimit(profile.id, 'exam', exam.id, exam.maxAttempts))),
    Promise.all(visible.map((exam) => examsRestricted(profile.id, exam.courseId))),
  ]);
  return NextResponse.json({
    success: true,
    exams: visible.map((exam, index) => {
      const attempts = mine.filter((attempt) => attempt.examId === exam.id);
      const done = attempts.filter((attempt) => attempt.status === 'submitted');
      const best = done.length ? done.reduce((top, attempt) => (attempt.percent > top.percent ? attempt : top)) : null;
      return {
        id: exam.id, title: exam.title, description: exam.description,
        courseId: exam.courseId, courseTitle: exam.courseTitle, moduleTitle: exam.moduleTitle, lessonTitle: exam.lessonTitle,
        durationMinutes: exam.durationMinutes, opensAt: exam.opensAt, closesAt: exam.closesAt, passMark: exam.passMark,
        maxAttempts: limits[index], restricted: restricted[index], questionCount: exam.questions.length,
        window: examWindow(exam),
        locked: locks[index], isFinal: !exam.lessonId && !exam.moduleId,
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
      if (await examsRestricted(profile.id, exam.courseId)) throw new Error('Exams are paused for you in this course. Please contact your instructor.');
      if (await examLocked(profile.id, exam)) throw new Error(exam.lessonId || exam.moduleId ? 'Finish every earlier part of this lesson before the exam.' : 'Finish every lesson of the course before the final exam.');
      const limit = await attemptLimit(profile.id, 'exam', exam.id, exam.maxAttempts);
      const started = await startAttempt({ ...exam, maxAttempts: limit }, { id: profile.id, name: profile.name || profile.email, email: profile.email });
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
