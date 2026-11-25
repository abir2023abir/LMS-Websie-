import { NextResponse } from 'next/server';
import { currentProfile, staffIdentity } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { closeExpiredStart, endsAt, listAttempts, quizzesForCourses, quizzesForLesson, startedAt, studentView } from '@/lib/quizzes';
import { stepOpen } from '@/lib/progression';
import { attemptLimit } from '@/lib/assessment-risk';

export const dynamic = 'force-dynamic';

// Published quizzes (without answers) for one lesson, or — with no lesson — for all
// of the signed-in student's enrolled courses. Includes the student's best score.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  const lessonId = url.searchParams.get('lessonId') || '';
  // A signed-in student (also the admin's demo student) always gets the student view with the lesson lock;
  // the staff view without the lock is only for admins and instructors who are not signed in as a student.
  const signedIn = await currentProfile();
  const asStudent = Boolean(signedIn?.roles.includes('Student'));
  const staff = asStudent ? null : await staffIdentity();
  const profile = staff ? null : signedIn;
  if (!staff && !profile) return NextResponse.json({ success: false, message: 'Please sign in.' }, { status: 401 });

  const enrolled = profile ? await getEnrollments(profile.id) : [];
  if (courseId && profile && !enrolled.includes(courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course to take its quizzes.' }, { status: 403 });
  }
  if (profile && courseId && lessonId && !(await stepOpen(profile.id, courseId, lessonId, 'quiz'))) {
    return NextResponse.json({ success: true, locked: true, message: 'Not open yet. Finish the overview and the video of this lesson first, then the quiz opens.', quizzes: [] });
  }
  const quizzes = courseId && lessonId ? await quizzesForLesson(courseId, lessonId) : await quizzesForCourses(courseId ? [courseId] : enrolled);
  // Timed quizzes: close an attempt whose time ran out, and find the ones still running.
  const running: number[] = [];
  for (const quiz of quizzes) {
    if (profile && quiz.timeLimitMinutes) await closeExpiredStart(quiz, profile.id);
    running.push(profile && quiz.timeLimitMinutes ? await startedAt(profile.id, quiz.id) : 0);
  }
  const attempts = profile ? await listAttempts(profile.id) : [];
  const limits = await Promise.all(quizzes.map((quiz) => (profile ? attemptLimit(profile.id, 'quiz', quiz.id, quiz.maxAttempts || 0) : Promise.resolve(quiz.maxAttempts || 0))));
  return NextResponse.json({
    success: true,
    quizzes: quizzes.map((quiz, index) => {
      const mine = attempts.filter((attempt) => attempt.quizId === quiz.id);
      return {
        // Staff previewing a timed quiz see its questions without starting a clock.
        ...studentView(quiz, !profile || running[index] > 0),
        endsAt: running[index] ? new Date(endsAt(quiz, running[index])).toISOString() : '',
        now: new Date().toISOString(),
        courseId: quiz.courseId,
        courseTitle: quiz.courseTitle,
        moduleTitle: quiz.moduleTitle,
        lessonTitle: quiz.lessonTitle,
        best: mine.length ? Math.max(...mine.map((attempt) => attempt.percent)) : null,
        passed: mine.some((attempt) => attempt.passed),
        attempts: mine.length,
        maxAttempts: limits[index],
      };
    }),
  });
}
