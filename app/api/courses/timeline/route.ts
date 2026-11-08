import { NextResponse } from 'next/server';
import { requireAdminWrite } from '@/lib/admin-guard';
import { clearTimeline, enrollmentClosedReason, getTimeline, saveTimeline } from '@/lib/course-timeline';
import { minimumLessonTime } from '@/lib/timeline-math';
import { courseLessons } from '@/lib/progression';

export const dynamic = 'force-dynamic';

// The four dates of a course (First Enrolled, Last Enrolled, Last Counting, Course Ending).
export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'courseId is required.' }, { status: 400 });
  const timeline = await getTimeline(courseId);
  const total = timeline ? (await courseLessons(courseId)).lessons.length : 0;
  return NextResponse.json({
    success: true,
    timeline: timeline?.input || null,
    totalLessons: total,
    minimumLessonHours: timeline && total ? Math.round((minimumLessonTime(timeline.dates, total) / 3600000) * 100) / 100 : 0,
    enrollmentClosed: await enrollmentClosedReason(courseId),
  });
}

export async function PUT(request: Request) {
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  try {
    const body = await request.json();
    const timeline = await saveTimeline(String(body.courseId || ''), {
      firstEnrolled: String(body.firstEnrolled || ''), lastEnrolled: String(body.lastEnrolled || ''),
      lastCounting: String(body.lastCounting || ''), courseEnding: String(body.courseEnding || ''),
    });
    return NextResponse.json({ success: true, timeline });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not save the dates.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'courseId is required.' }, { status: 400 });
  await clearTimeline(courseId);
  return NextResponse.json({ success: true });
}
