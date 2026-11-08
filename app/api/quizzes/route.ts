import { NextResponse } from 'next/server';
import { currentProfile, staffIdentity } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { listAttempts, quizzesForCourses, quizzesForLesson, studentView } from '@/lib/quizzes';
import { stepOpen } from '@/lib/progression';
import { attemptLimit } from '@/lib/assessment-risk';

export const dynamic = 'force-dynamic';

// Published quizzes (without answers) for one lesson, or — with no lesson — for all
// of the signed-in student's enrolled courses. Includes the student's best score.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  const lessonId = url.searchParams.get('lessonId') || '';
  const staff = await staffIdentity();
  const profile = staff ? null : await currentProfile();
  if (!staff && !profile) return NextResponse.json({ success: false, message: 'Please sign in.' }, { status: 401 });

  const enrolled = profile ? await getEnrollments(profile.id) : [];
  if (courseId && profile && !enrolled.includes(courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course to take its quizzes.' }, { status: 403 });
  }
  if (profile && courseId && lessonId && !(await stepOpen(profile.id, courseId, lessonId, 'quiz'))) {
    return NextResponse.json({ success: true, locked: true, message: 'Not open yet. Finish the overview and the video of this lesson first, then the quiz opens.', quizzes: [] });
  }
  const quizzes = courseId && lessonId ? await quizzesForLesson(courseId, lessonId) : await quizzesForCourses(courseId ? [courseId] : enrolled);
  const attempts = profile ? await listAttempts(profile.id) : [];
  const limits = await Promise.all(quizzes.map((quiz) => (profile ? attemptLimit(profile.id, 'quiz', quiz.id, quiz.maxAttempts || 0) : Promise.resolve(quiz.maxAttempts || 0))));
  return NextResponse.json({
    success: true,
    quizzes: quizzes.map((quiz, index) => {
      const mine = attempts.filter((attempt) => attempt.quizId === quiz.id);
      return {
        ...studentView(quiz),
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
