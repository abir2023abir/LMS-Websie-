import { NextResponse } from 'next/server';
import { bookedTimesOn, continueDeskThread, getDeskThread, listDeskThreads, openDeskThread, replyDeskThread, studentThreads, type DeskKind } from '@/lib/desk-messages';
import { currentProfile, staffDenied, staffIdentity } from '@/lib/user-session';
import { getCourseById, getCoursesByInstructor } from '@/lib/db';
import { listCourseSettings } from '@/lib/accounts';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';

async function visibleThreadsFor(staff: NonNullable<Awaited<ReturnType<typeof staffIdentity>>>) {
  const threads = await listDeskThreads();
  if (staff.admin) return threads;
  const [courses, settings] = await Promise.all([getCoursesByInstructor(staff.profile.id), listCourseSettings()]);
  const assigned = settings.filter((row) => String(row.mentor_email || '').toLowerCase() === staff.profile.email.toLowerCase()).map((row) => row.course_id);
  const courseIds = new Set([...courses.map((course) => course.id || ''), ...assigned]);
  return threads.filter((item) => item.instructorId === staff.profile.id || item.instructorId.toLowerCase() === staff.profile.email.toLowerCase() || courseIds.has(item.courseId));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('availability') === '1') {
    const date = url.searchParams.get('date') || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ success: false, message: 'Invalid date.' }, { status: 400 });
    return NextResponse.json({ success: true, bookedTimes: await bookedTimesOn(date) });
  }
  if (url.searchParams.get('board') === '1') {
    const staff = await staffIdentity();
    if (!staff) return staffDenied();
    return NextResponse.json({ success: true, threads: await visibleThreadsFor(staff) });
  }
  if (url.searchParams.get('mine') === '1') {
    // A signed-in student's questions (and replies) for a course or one lesson.
    const profile = await currentProfile();
    if (!profile) return NextResponse.json({ success: false, message: 'Please sign in.' }, { status: 401 });
    const threads = await studentThreads(profile.email, url.searchParams.get('courseId') || '', url.searchParams.get('lessonId') || '');
    return NextResponse.json({ success: true, threads });
  }
  const id = url.searchParams.get('id') || '';
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  const thread = await getDeskThread(id);
  if (!thread || thread.email.toLowerCase() !== email) {
    return NextResponse.json({ success: false, message: 'Message not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, thread });
}

export async function POST(request: Request) {
  if (rateLimited(request, 'messages', 30, 10 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const body = await request.json();
    if (body.action === 'reply') {
      const staff = await staffIdentity();
      if (!staff) return staffDenied();
      const id = String(body.id || '');
      const existing = await getDeskThread(id);
      if (!existing) return NextResponse.json({ success: false, message: 'Message not found.' }, { status: 404 });
      if (!staff.admin && existing.instructorId !== staff.profile.id && existing.instructorId.toLowerCase() !== staff.profile.email.toLowerCase()) {
        const [courses, settings] = await Promise.all([getCoursesByInstructor(staff.profile.id), listCourseSettings()]);
        const assigned = settings.some((row) => row.course_id === existing.courseId && String(row.mentor_email || '').toLowerCase() === staff.profile.email.toLowerCase());
        if (!assigned && !courses.some((course) => course.id === existing.courseId)) return staffDenied();
      }
      const thread = await replyDeskThread(id, String(body.text || ''), staff.admin ? 'admin' : 'instructor');
      return NextResponse.json({ success: true, thread, threads: await visibleThreadsFor(staff) });
    }
    if (body.id) {
      const thread = await continueDeskThread(String(body.id), String(body.email || ''), String(body.text || ''));
      return NextResponse.json({ success: true, thread });
    }
    const kind: DeskKind = body.kind === 'service' ? 'service' : 'student';
    const courseId = String(body.courseId || '');
    const sender = kind === 'student' ? await currentProfile() : null;
    if (kind === 'student' && !sender) return NextResponse.json({ success: false, message: 'Sign in to send a course question.' }, { status: 401 });
    if (kind === 'student' && !sender?.roles.includes('Student')) return NextResponse.json({ success: false, message: 'Only a student account can send course questions.' }, { status: 403 });
    if (kind === 'student' && !courseId) return NextResponse.json({ success: false, message: 'Course context is required for a lesson question.' }, { status: 400 });
    const course = kind === 'student' && courseId ? await getCourseById(courseId) : null;
    if (kind === 'student' && !course) return NextResponse.json({ success: false, message: 'Could not find that course.' }, { status: 404 });
    const thread = await openDeskThread({
      kind,
      name: sender?.name || String(body.name || ''),
      email: sender?.email || String(body.email || ''),
      text: String(body.text || ''),
      courseId,
      courseTitle: String(course?.title || body.courseTitle || ''),
      rank: Number(body.rank) || 0,
      rankTotal: Number(body.rankTotal) || 0,
      progress: Number(body.progress) || 0,
      instructorId: course?.instructorId || '',
      instructorName: course?.instructorName || course?.instructorId || '',
      moduleTitle: String(body.moduleTitle || ''),
      lessonId: String(body.lessonId || ''),
      lessonTitle: String(body.lessonTitle || ''),
      phone: String(body.phone || ''),
      topic: String(body.topic || ''),
      billing: String(body.billing || ''),
      appointmentDate: String(body.appointmentDate || ''),
      appointmentTime: String(body.appointmentTime || ''),
      company: String(body.company || ''),
      monthlyRevenue: String(body.monthlyRevenue || ''),
    });
    return NextResponse.json({ success: true, thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the message.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
