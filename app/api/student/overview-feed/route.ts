import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments, listPayments } from '@/lib/payments';
import { listLiveClasses } from '@/lib/live-classes';
import { listAssignments, listSubmissions } from '@/lib/assignments';
import { listExams } from '@/lib/exams';
import { listRequests } from '@/lib/progression';
import { noticesFor } from '@/lib/assessment-risk';
import { listCourseEdits } from '@/lib/course-edits';
import { getAllCourses } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DAY = 86400000;
type ScheduleItem = { id: string; at: string; kind: 'live' | 'assignment' | 'exam'; title: string; detail: string; badge: 'LIVE' | 'Soon' | 'Upcoming' };
type Notice = { id: string; at: string; kind: 'deadline' | 'live' | 'lesson' | 'risk' | 'review' | 'request' | 'done'; title: string; detail: string; tag: string };

const safe = <T,>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback);

// Student → Overview: the signed-in student's own schedule and notifications, only for courses they are enrolled in.
export async function GET() {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;

  const now = Date.now();
  const enrolled = new Set(await safe(getEnrollments(profile.id), []));
  const [lives, assignments, submissions, exams, requests, notices, edits, courses, payments] = await Promise.all([
    safe(listLiveClasses(), []), safe(listAssignments(), []), safe(listSubmissions(), []), safe(listExams(), []),
    safe(listRequests(), []), safe(noticesFor(profile.id), []), safe(listCourseEdits(), {}), safe(getAllCourses(), []), safe(listPayments(), []),
  ]);
  const courseTitle = (id: string, fallback = '') => edits[id]?.title || courses.find((course) => String(course.id) === id)?.title || fallback || 'Course';
  const mine = <T extends { courseId: string }>(list: T[]) => list.filter((item) => enrolled.has(item.courseId));

  /* ── Upcoming schedule ── */
  const schedule: ScheduleItem[] = [];
  for (const live of mine(lives)) {
    if (!live.published) continue;
    const start = Date.parse(live.startsAt);
    const end = start + live.durationMinutes * 60000;
    if (!Number.isFinite(start) || end < now) continue;
    schedule.push({
      id: `live-${live.id}`, at: live.startsAt, kind: 'live',
      title: `Live Class — ${courseTitle(live.courseId, live.courseTitle)}`,
      detail: [live.moduleTitle, live.title].filter(Boolean).join(' · '),
      badge: start <= now ? 'LIVE' : start - now < DAY ? 'Soon' : 'Upcoming',
    });
  }
  const submitted = new Set(submissions.filter((item) => item.studentId === profile.id).map((item) => item.assignmentId));
  for (const item of mine(assignments)) {
    if (!item.published || !item.dueDate || submitted.has(item.id)) continue;
    const due = Date.parse(`${item.dueDate}T23:59:00+06:00`);
    if (!Number.isFinite(due) || due < now) continue;
    schedule.push({
      id: `asg-${item.id}`, at: new Date(due).toISOString(), kind: 'assignment',
      title: 'Assignment submission window',
      detail: `${item.moduleTitle || courseTitle(item.courseId, item.courseTitle)} · ${item.title} · Deadline 11:59 PM`,
      badge: due - now < DAY ? 'Soon' : 'Upcoming',
    });
  }
  for (const exam of mine(exams)) {
    if (!exam.published) continue;
    for (const [label, value] of [['opens', exam.opensAt], ['closes', exam.closesAt]] as const) {
      const at = Date.parse(value || '');
      if (!Number.isFinite(at) || at < now) continue;
      schedule.push({
        id: `exam-${exam.id}-${label}`, at: new Date(at).toISOString(), kind: 'exam',
        title: `Exam ${label} — ${exam.title}`,
        detail: `${courseTitle(exam.courseId, exam.courseTitle)}${exam.lessonTitle ? ` · ${exam.lessonTitle}` : ''}`,
        badge: at - now < DAY ? 'Soon' : 'Upcoming',
      });
    }
  }
  schedule.sort((a, b) => a.at.localeCompare(b.at));

  /* ── Notifications ── */
  const list: Notice[] = [];
  for (const request of requests) {
    if (request.studentId !== profile.id) continue;
    const extension = request.kind === 'extension';
    if (request.status === 'approved' && now - Date.parse(request.decidedAt || '') < 14 * DAY) {
      list.push(extension
        ? { id: `ext-${request.id}`, at: request.decidedAt, kind: 'deadline', title: 'Course deadline extended', detail: `${request.courseTitle}${request.days ? ` · +${request.days} days` : ''}${request.reply ? ` · ${request.reply}` : ''}`, tag: 'Approved' }
        : { id: `mov-${request.id}`, at: request.decidedAt, kind: 'done', title: 'Next lesson unlocked', detail: `${request.courseTitle} · ${request.nextLessonTitle || request.lessonTitle}`, tag: 'Approved' });
    } else if (request.status === 'rejected' && now - Date.parse(request.decidedAt || '') < 14 * DAY) {
      list.push({ id: `rej-${request.id}`, at: request.decidedAt, kind: 'request', title: extension ? 'Request for more time answered' : 'Request to move on answered', detail: `${request.courseTitle}${request.reply ? ` · ${request.reply}` : ''}`, tag: 'Reply' });
    } else if (request.status === 'pending') {
      list.push({ id: `req-${request.id}`, at: request.createdAt, kind: 'request', title: extension ? 'More time requested' : 'Request to move on sent', detail: request.courseTitle, tag: 'Pending' });
    }
  }
  for (const live of mine(lives)) {
    const start = Date.parse(live.startsAt);
    if (live.published && Number.isFinite(start) && start > now && start - now < DAY) {
      const when = new Date(start).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' });
      list.push({ id: `soon-${live.id}`, at: new Date(now).toISOString(), kind: 'live', title: 'Live program starts soon', detail: `${courseTitle(live.courseId, live.courseTitle)} · ${when}`, tag: 'Live' });
    }
  }
  for (const notice of notices) {
    const title = notice.kind === 'warning' ? 'A note from your mentor' : notice.kind === 'study' ? 'Study plan from your mentor' : 'Your mentor will contact you';
    list.push({ id: `note-${notice.id}`, at: notice.at, kind: notice.kind === 'warning' ? 'risk' : 'review', title, detail: `${courseTitle(notice.courseId)} · ${notice.text}`, tag: 'Mentor' });
  }
  const assignmentTitle = new Map(assignments.map((item) => [item.id, item.title]));
  for (const submission of submissions) {
    if (submission.studentId !== profile.id || submission.status === 'submitted' || !submission.reviewedAt) continue;
    list.push({
      id: `sub-${submission.id}`, at: submission.reviewedAt, kind: submission.status === 'graded' ? 'done' : 'review',
      title: submission.status === 'graded' ? 'Assignment marked' : 'Assignment needs changes',
      detail: `${assignmentTitle.get(submission.assignmentId) || 'Assignment'}${submission.score !== null ? ` · ${submission.score} marks` : ''}`,
      tag: submission.status === 'graded' ? 'Marked' : 'Fix',
    });
  }
  for (const [courseId, edit] of Object.entries(edits)) {
    const at = Date.parse(edit.updatedAt || '');
    if (enrolled.has(courseId) && Number.isFinite(at) && now - at < 7 * DAY && edit.modules?.length) {
      list.push({ id: `edit-${courseId}`, at: edit.updatedAt!, kind: 'lesson', title: 'New lesson notice', detail: `${courseTitle(courseId)} · New lessons are available.`, tag: 'Today' });
    }
  }
  for (const payment of payments) {
    if (payment.studentId !== profile.id) continue;
    const at = payment.updatedAt || payment.createdAt;
    if (now - Date.parse(at) > 14 * DAY) continue;
    if (payment.status === 'pending') list.push({ id: `pay-${payment.id}`, at, kind: 'request', title: 'Enrollment waiting for approval', detail: `${courseTitle(payment.courseId, payment.courseTitle)} · ${payment.method || 'Payment'}`, tag: 'Pending' });
    else if (payment.status === 'paid' || payment.status === 'approved') list.push({ id: `pay-${payment.id}`, at, kind: 'done', title: 'Enrollment approved', detail: courseTitle(payment.courseId, payment.courseTitle), tag: 'Approved' });
    else if (payment.status === 'rejected') list.push({ id: `pay-${payment.id}`, at, kind: 'risk', title: 'Payment not accepted', detail: `${courseTitle(payment.courseId, payment.courseTitle)} · contact the team`, tag: 'Rejected' });
  }
  list.sort((a, b) => b.at.localeCompare(a.at));

  return NextResponse.json({ success: true, schedule: schedule.slice(0, 8), notifications: list.slice(0, 8) });
}
