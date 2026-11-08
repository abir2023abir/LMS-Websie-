import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { courseProgress, createRequest, lessonOpen, markPartDone, markVideoDone } from '@/lib/progression';
import { JOIN_EARLY_MS, liveClassesForLesson, recordJoin } from '@/lib/live-classes';
import { courseRanking } from '@/lib/rankings';
import { examsRestricted, noticesFor } from '@/lib/assessment-risk';

export const dynamic = 'force-dynamic';

// The student's path through a course, the timeline, and the chosen lesson's live classes.
export async function GET(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  if (!(await getEnrollments(profile.id)).includes(courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course first.' }, { status: 403 });
  }
  const progress = await courseProgress(profile.id, courseId, { sync: true });
  const lessonId = url.searchParams.get('lessonId') || progress.currentLessonId;
  const now = Date.now();
  // Live classes never depend on the lesson path: a student can join even when behind.
  const lives = (await liveClassesForLesson(courseId, lessonId)).map((live) => {
    const start = new Date(live.startsAt).getTime();
    return {
      id: live.id, title: live.title, description: live.description, startsAt: live.startsAt, durationMinutes: live.durationMinutes,
      joinUrl: live.joinUrl,
      recordingUrl: live.recordingUrl,
      joinable: now >= start - JOIN_EARLY_MS && now <= start + live.durationMinutes * 60000,
      attended: live.attendees.includes(profile.id),
    };
  });
  const ranking = await courseRanking(courseId);
  const myRank = ranking.findIndex((row) => row.studentId === profile.id);
  const [notices, examsPaused] = await Promise.all([noticesFor(profile.id, courseId), examsRestricted(profile.id, courseId)]);
  return NextResponse.json({ success: true, ...progress, lives, notices, examsPaused, rank: myRank >= 0 ? myRank + 1 : null, rankTotal: ranking.length });
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
    if (body.action === 'part') {
      // The student confirms the overview or the notes were read. The lesson must be open.
      const part = body.part === 'notes' ? 'notes' : body.part === 'overview' ? 'overview' : '';
      if (!part) throw new Error('Unknown part.');
      const progress = await courseProgress(profile.id, courseId);
      const lesson = progress.lessons.find((item) => item.lessonId === lessonId);
      const step = lesson?.steps.find((item) => item.key === part);
      if (!lesson || !step) throw new Error('This lesson has no such part.');
      if (step.state === 'locked') throw new Error(step.detail || 'This part is not open yet.');
      await markPartDone(profile.id, courseId, lessonId, part);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'join') {
      const live = await recordJoin(String(body.liveId || ''), profile.id);
      if (live.courseId !== courseId) throw new Error('Live class not found.');
      return NextResponse.json({ success: true, joinUrl: live.joinUrl });
    }
    if (body.action === 'extension') {
      // Only when the student is behind schedule or the course has ended.
      const progress = await courseProgress(profile.id, courseId);
      const status = progress.timeline.status;
      if (status !== 'at-risk' && status !== 'expired') throw new Error('You can ask for more time only when you are behind schedule or the course has ended.');
      const lesson = progress.lessons.find((item) => item.lessonId === lessonId) || progress.lessons.find((item) => item.state !== 'done');
      await createRequest({
        studentId: profile.id, studentName: profile.name || profile.email, studentEmail: profile.email,
        courseId, courseTitle: progress.courseTitle, lessonId: lesson?.lessonId || lessonId, lessonTitle: lesson?.lessonTitle || '',
        nextLessonTitle: '', message: String(body.message || ''), kind: 'extension',
      });
      return NextResponse.json({ success: true });
    }
    throw new Error('Unknown action.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
