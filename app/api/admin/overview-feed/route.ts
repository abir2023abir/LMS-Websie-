import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { listLiveClasses } from '@/lib/live-classes';
import { listAssignments, listSubmissions } from '@/lib/assignments';
import { listExams } from '@/lib/exams';
import { listRequests } from '@/lib/progression';
import { riskAlerts } from '@/lib/assessment-risk';
import { listCourseEdits } from '@/lib/course-edits';
import { getAllCourses } from '@/lib/db';
import { listPayments } from '@/lib/payments';
import { deviceOverview, resetDevice, setDeviceRule } from '@/lib/device-guard';

export const dynamic = 'force-dynamic';

const DAY = 86400000;
type Badge = 'LIVE' | 'Soon' | 'Upcoming';
type ScheduleItem = { id: string; at: string; kind: 'live' | 'assignment' | 'exam'; title: string; detail: string; badge: Badge };
type Notice = { id: string; at: string; kind: 'deadline' | 'live' | 'lesson' | 'risk' | 'review' | 'request'; title: string; detail: string; tag: string };

const safe = <T,>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback);

// Admin → Overview: upcoming schedule, latest notifications, device alerts and new enrollments.
export async function GET() {
  // Admin session only: it lists device alerts and payments.
  const denied = await requireAdmin();
  if (denied) return denied;

  const now = Date.now();
  const [lives, assignments, submissions, exams, requests, risks, edits, courses, payments, devices] = await Promise.all([
    safe(listLiveClasses(), []), safe(listAssignments(), []), safe(listSubmissions(), []), safe(listExams(), []),
    safe(listRequests(), []), safe(riskAlerts(null), []), safe(listCourseEdits(), {}), safe(getAllCourses(), []),
    safe(listPayments(), []), deviceOverview(),
  ]);
  const courseTitle = (id: string, fallback = '') => edits[id]?.title || courses.find((course) => String(course.id) === id)?.title || fallback || 'Course';

  /* ── Upcoming schedule ── */
  const schedule: ScheduleItem[] = [];
  for (const live of lives) {
    if (!live.published) continue;
    const start = Date.parse(live.startsAt);
    const end = start + live.durationMinutes * 60000;
    if (!Number.isFinite(start) || end < now) continue;
    schedule.push({
      id: `live-${live.id}`, at: live.startsAt, kind: 'live',
      title: `Live Class — ${courseTitle(live.courseId, live.courseTitle)}`,
      detail: [live.lessonTitle || live.moduleTitle, live.title].filter(Boolean).join(' · '),
      badge: start <= now ? 'LIVE' : start - now < DAY ? 'Soon' : 'Upcoming',
    });
  }
  for (const item of assignments) {
    if (!item.published || !item.dueDate) continue;
    const due = Date.parse(`${item.dueDate}T23:59:00+06:00`);
    if (!Number.isFinite(due) || due < now) continue;
    schedule.push({
      id: `asg-${item.id}`, at: new Date(due).toISOString(), kind: 'assignment',
      title: `Assignment submission — ${item.title}`,
      detail: `${courseTitle(item.courseId, item.courseTitle)} · ${item.lessonTitle || item.moduleTitle} · Deadline 11:59 PM`,
      badge: due - now < DAY ? 'Soon' : 'Upcoming',
    });
  }
  for (const exam of exams) {
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
  const notices: Notice[] = [];
  for (const request of requests) {
    const extension = request.kind === 'extension';
    if (request.status === 'pending') {
      notices.push({ id: `req-${request.id}`, at: request.createdAt, kind: 'request', title: extension ? 'More time requested' : 'Request to move on', detail: `${request.studentName} · ${request.courseTitle}`, tag: 'Pending' });
    } else if (request.status === 'approved' && extension && now - Date.parse(request.decidedAt || '') < 14 * DAY) {
      notices.push({ id: `ext-${request.id}`, at: request.decidedAt, kind: 'deadline', title: 'Course deadline extended', detail: `${request.studentName} · ${request.courseTitle}${request.days ? ` · +${request.days} days` : ''}`, tag: 'Done' });
    }
  }
  for (const live of lives) {
    const start = Date.parse(live.startsAt);
    if (live.published && Number.isFinite(start) && start > now && start - now < DAY) {
      notices.push({ id: `soon-${live.id}`, at: new Date(now).toISOString(), kind: 'live', title: 'Live class starts soon', detail: `${courseTitle(live.courseId, live.courseTitle)} · ${live.title}`, tag: 'Live' });
    }
  }
  for (const risk of risks) {
    if (risk.status !== 'open') continue;
    const last = risk.attempts[risk.attempts.length - 1]?.at || '';
    notices.push({ id: `risk-${risk.key}`, at: last || new Date(now).toISOString(), kind: 'risk', title: `Repeated ${risk.kind} failures`, detail: `${risk.studentName} · ${risk.assessmentTitle} · failed ${risk.failed} times`, tag: 'At risk' });
  }
  const assignmentTitle = new Map(assignments.map((item) => [item.id, item.title]));
  for (const submission of submissions) {
    if (submission.status !== 'submitted') continue;
    notices.push({ id: `sub-${submission.id}`, at: submission.submittedAt, kind: 'review', title: 'Assignment waiting for review', detail: `${submission.studentName} · ${assignmentTitle.get(submission.assignmentId) || 'Assignment'}`, tag: 'Review' });
  }
  for (const [courseId, edit] of Object.entries(edits)) {
    const at = Date.parse(edit.updatedAt || '');
    if (Number.isFinite(at) && now - at < 7 * DAY && edit.modules?.length) {
      notices.push({ id: `edit-${courseId}`, at: edit.updatedAt!, kind: 'lesson', title: 'Lessons updated', detail: `${courseTitle(courseId)} · enrolled students see the new lessons`, tag: 'New' });
    }
  }
  notices.sort((a, b) => b.at.localeCompare(a.at));

  /* ── New enrollments (payments are the enrollment requests) ── */
  const enrollments = [...payments]
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
    .slice(0, 8)
    .map((payment) => ({
      id: payment.id,
      at: payment.updatedAt || payment.createdAt,
      name: payment.studentName,
      studentId: payment.studentId,
      courseTitle: courseTitle(payment.courseId, payment.courseTitle),
      status: payment.status === 'paid' || payment.status === 'approved' ? 'Approved' : payment.status === 'pending' ? 'Pending' : payment.status === 'rejected' ? 'Rejected' : 'Failed',
      method: payment.method || (payment.source === 'sslcommerz' ? 'SSLCommerz' : 'Manual'),
    }));

  return NextResponse.json({
    success: true,
    schedule: schedule.slice(0, 8),
    notifications: notices.slice(0, 8),
    security: { enabled: devices.enabled, protectedCount: devices.protectedCount, alerts: devices.alerts.map((alert) => ({ ...alert, stillBlocked: Boolean(devices.devices[alert.studentId]) })) },
    enrollments,
    pendingEnrollments: payments.filter((payment) => payment.status === 'pending').length,
  });
}

// Admin only: turn the single-device rule on or off, or let one student use a new device.
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'device-rule') await setDeviceRule(Boolean(body.enabled));
    else if (body.action === 'reset-device' && body.studentId) await resetDevice(String(body.studentId));
    else return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not save.' }, { status: 500 });
  }
}
