import { NextResponse } from 'next/server';
import { courseAccessDenied } from '@/lib/mentor-scope';
import { requireAdminWrite } from '@/lib/admin-guard';
import { clearTimeline, enrollmentClosedReason, getDayPlan, getTimeline, saveDayPlan, saveTimeline } from '@/lib/course-timeline';
import { minimumLessonTime } from '@/lib/timeline-math';
import { courseLessons } from '@/lib/progression';

export const dynamic = 'force-dynamic';

const DAY = 86400000;

/**
 * A course's timeline. Day-wise (preferred): the course length in days, counted from each
 * student's own enrollment, plus optional days per lesson. Older courses may still have the
 * four fixed dates (First Enrolled, Last Enrolled, Last Counting, Course Ending).
 */
export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'courseId is required.' }, { status: 400 });
  const [timeline, plan, shape] = await Promise.all([getTimeline(courseId), getDayPlan(courseId), courseLessons(courseId).catch(() => ({ lessons: [] as { days?: number }[] }))]);
  const total = shape.lessons.length;
  const lessonDaysTotal = shape.lessons.reduce((sum, lesson) => sum + (lesson.days || 0), 0);
  const accessDays = plan?.accessDays || lessonDaysTotal;
  return NextResponse.json({
    success: true,
    accessDays: plan?.accessDays || 0,
    lessonDaysTotal,
    lessonsWithDays: shape.lessons.filter((lesson) => (lesson.days || 0) > 0).length,
    totalLessons: total,
    // Even share of the course length per lesson (the minimum lesson time of the day-wise plan).
    minimumLessonHours: accessDays && total
      ? Math.round(((accessDays * DAY) / total / 3600000) * 100) / 100
      : timeline && total ? Math.round((minimumLessonTime(timeline.dates, total) / 3600000) * 100) / 100 : 0,
    timeline: accessDays ? null : timeline?.input || null,
    // The four dates as saved in course Settings, even when days are in use for deadlines.
    dates: timeline?.input || null,
    enrollmentClosed: await enrollmentClosedReason(courseId),
  });
}

export async function PUT(request: Request) {
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '');
    const outside = await courseAccessDenied(courseId);
    if (outside) return outside;
    if (body.accessDays !== undefined) {
      return NextResponse.json({ success: true, plan: await saveDayPlan(courseId, Number(body.accessDays)) });
    }
    const timeline = await saveTimeline(courseId, {
      firstEnrolled: String(body.firstEnrolled || ''), lastEnrolled: String(body.lastEnrolled || ''),
      lastCounting: String(body.lastCounting || ''), courseEnding: String(body.courseEnding || ''),
    });
    // Saved dates replace a course length in days.
    await saveDayPlan(courseId, 0);
    return NextResponse.json({ success: true, timeline });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not save the timeline.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'courseId is required.' }, { status: 400 });
  const outside = await courseAccessDenied(courseId);
  if (outside) return outside;
  await clearTimeline(courseId);
  // "Remove dates" in course Settings leaves a course length in days alone.
  if (new URL(request.url).searchParams.get('part') !== 'dates') await saveDayPlan(courseId, 0);
  return NextResponse.json({ success: true });
}
