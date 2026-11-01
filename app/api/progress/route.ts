import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { courseProgress, createRequest, lessonOpen, markVideoDone } from '@/lib/progression';
import { liveClassesForLesson } from '@/lib/live-classes';
import { courseRanking } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

// The student's step-by-step path through a course, plus the chosen lesson's live classes.
export async function GET(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  if (!(await getEnrollments(profile.id)).includes(courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course first.' }, { status: 403 });
  }
  const progress = await courseProgress(profile.id, courseId);
  const lessonId = url.searchParams.get('lessonId') || progress.currentLessonId;
  const lesson = progress.lessons.find((item) => item.lessonId === lessonId);
  const liveStep = lesson?.steps.find((step) => step.key === 'live');
  const liveOpen = Boolean(liveStep && liveStep.state !== 'locked');
  const lives = (await liveClassesForLesson(courseId, lessonId)).map((live) => ({
    id: live.id, title: live.title, description: live.description, startsAt: live.startsAt, durationMinutes: live.durationMinutes,
    // The meeting link is only shared once every earlier step is done.
    joinUrl: liveOpen ? live.joinUrl : '',
    recordingUrl: liveOpen ? live.recordingUrl : '',
    attended: live.attendees.includes(profile.id),
  }));
  const ranking = await courseRanking(courseId);
  const myRank = ranking.findIndex((row) => row.studentId === profile.id);
  return NextResponse.json({ success: true, ...progress, lives, rank: myRank >= 0 ? myRank + 1 : null, rankTotal: ranking.length });
}

export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '');
    const lessonId = String(body.lessonId || '');
    if (!(await getEnrollments(profile.id)).includes(courseId)) throw new Error('Enroll in this course first.');
    if (body.action === 'video') {
      if (Number(body.percent) >= 80 && (await lessonOpen(profile.id, courseId, lessonId))) await markVideoDone(profile.id, courseId, lessonId);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'request') {
      const progress = await courseProgress(profile.id, courseId);
      const index = progress.lessons.findIndex((item) => item.lessonId === lessonId);
      const lesson = progress.lessons[index];
      const step = lesson?.steps.find((item) => item.key === 'approval' || item.key === 'live');
      if (!lesson || !step || step.state !== 'current') throw new Error('Finish the earlier steps of this lesson first.');
      await createRequest({
        studentId: profile.id, studentName: profile.name || profile.email, studentEmail: profile.email,
        courseId, courseTitle: progress.courseTitle, lessonId, lessonTitle: lesson.lessonTitle,
        nextLessonTitle: progress.lessons[index + 1]?.lessonTitle || '', message: String(body.message || ''),
      });
      return NextResponse.json({ success: true });
    }
    throw new Error('Unknown action.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
