import { kvGet, kvSet } from '@/lib/kv-store';
import { enrollmentWindow, validateTimelineDates, type TimelineDates } from '@/lib/timeline-math';

/*
 * Per-course timeline dates (set by the admin), each student's real enrollment time, and the
 * course extensions an admin grants. Everything is stored with the server's clock.
 */

const TIMELINES_KEY = 'course-timelines'; // courseId → ISO strings
const ENROLL_DATES_KEY = 'enrollment-dates'; // studentId → courseId → ISO (written by grantEnrollment)
const EXTENSIONS_KEY = 'course-extensions'; // studentId → courseId → ISO of the new ending date
const DAY_PLANS_KEY = 'course-day-plans'; // courseId → { accessDays }
const DAY = 86400000;

/**
 * Day-wise timeline: the course runs for a number of days counted from each student's own
 * enrollment, so a student who joins ten days later still gets the full time. Lessons may also
 * have their own number of days (set beside each lesson in the course builder).
 */
export type DayPlan = { accessDays: number };

export type TimelineInput = { firstEnrolled: string; lastEnrolled: string; lastCounting: string; courseEnding: string };

const toDates = (input: TimelineInput): TimelineDates => ({
  firstEnrolled: Date.parse(input.firstEnrolled),
  lastEnrolled: Date.parse(input.lastEnrolled),
  lastCounting: Date.parse(input.lastCounting),
  courseEnding: Date.parse(input.courseEnding),
});

export async function listTimelines(): Promise<Record<string, TimelineInput>> {
  const all = await kvGet<Record<string, TimelineInput>>(TIMELINES_KEY, {});
  return all && typeof all === 'object' ? all : {};
}

/** The course's four dates, or null when the admin has not set a timeline for it. */
export async function getTimeline(courseId: string): Promise<{ input: TimelineInput; dates: TimelineDates } | null> {
  const input = (await listTimelines())[courseId];
  if (!input) return null;
  const dates = toDates(input);
  return validateTimelineDates(dates) ? null : { input, dates };
}

export async function saveTimeline(courseId: string, input: TimelineInput) {
  const dates = toDates(input);
  const problem = validateTimelineDates(dates);
  if (problem) throw new Error(problem);
  const clean: TimelineInput = {
    firstEnrolled: new Date(dates.firstEnrolled).toISOString(),
    lastEnrolled: new Date(dates.lastEnrolled).toISOString(),
    lastCounting: new Date(dates.lastCounting).toISOString(),
    courseEnding: new Date(dates.courseEnding).toISOString(),
  };
  await kvSet(TIMELINES_KEY, { ...(await listTimelines()), [courseId]: clean });
  return clean;
}

export async function clearTimeline(courseId: string) {
  const all = await listTimelines();
  delete all[courseId];
  await kvSet(TIMELINES_KEY, all);
}

/** A message when new students cannot enroll right now, '' when enrollment is open (or no timeline is set). */
export async function enrollmentClosedReason(courseId: string, now = Date.now()): Promise<string> {
  if (await getDayPlan(courseId)) return '';
  const timeline = await getTimeline(courseId);
  if (!timeline) return '';
  const state = enrollmentWindow(timeline.dates, now);
  const day = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' });
  if (state === 'not-open') return `Enrollment for this course opens on ${day(timeline.dates.firstEnrolled)}.`;
  if (state === 'closed') return `Enrollment for this course closed on ${day(timeline.dates.lastEnrolled)}.`;
  return '';
}

/** When the student really enrolled (server time). Older enrollments fall back to the approved payment. */
export async function enrollmentDate(studentId: string, courseId: string): Promise<number> {
  const single = await kvGet<string | null>(`enroll-at:${studentId}:${courseId}`, null);
  const singleAt = Date.parse(single || '');
  if (Number.isFinite(singleAt)) return singleAt;
  const all = await kvGet<Record<string, Record<string, string>>>(ENROLL_DATES_KEY, {});
  const saved = Date.parse(all[studentId]?.[courseId] || '');
  if (Number.isFinite(saved)) return saved;
  const { listPayments } = await import('@/lib/payments');
  const payment = (await listPayments())
    .filter((item) => item.studentId === studentId && item.courseId === courseId && (item.status === 'paid' || item.status === 'approved'))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))[0];
  const found = Date.parse(payment?.updatedAt || '');
  const at = Number.isFinite(found) ? found : Date.now();
  await kvSet(ENROLL_DATES_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: new Date(at).toISOString() } });
  return at;
}

/* ── admin extension: a later ending date for one student ── */
export async function endingOverride(studentId: string, courseId: string): Promise<number> {
  const all = await kvGet<Record<string, Record<string, string>>>(EXTENSIONS_KEY, {});
  const at = Date.parse(all[studentId]?.[courseId] || '');
  return Number.isFinite(at) ? at : 0;
}

export async function extendCourseEnding(studentId: string, courseId: string, days: number) {
  const { courseLessons } = await import('@/lib/progression');
  const lessonDays = (await courseLessons(courseId)).lessons.reduce((sum, lesson) => sum + (lesson.days || 0), 0);
  const timeline = await timelineFor(studentId, courseId, lessonDays);
  if (!timeline) throw new Error('This course has no timeline yet.');
  const add = Math.max(1, Math.min(365, Math.round(Number(days) || 0)));
  const base = Math.max(timeline.dates.courseEnding, await endingOverride(studentId, courseId), Date.now());
  const next = new Date(base + add * 86400000).toISOString();
  const all = await kvGet<Record<string, Record<string, string>>>(EXTENSIONS_KEY, {});
  await kvSet(EXTENSIONS_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: next } });
  return next;
}

/* ── day-wise plans ── */
export async function listDayPlans(): Promise<Record<string, DayPlan>> {
  const all = await kvGet<Record<string, DayPlan>>(DAY_PLANS_KEY, {});
  return all && typeof all === 'object' ? all : {};
}

export async function getDayPlan(courseId: string): Promise<DayPlan | null> {
  const plan = (await listDayPlans())[courseId];
  return plan && plan.accessDays > 0 ? plan : null;
}

/** Saves the course length in days (0 removes it). A day-wise plan replaces the four fixed dates. */
export async function saveDayPlan(courseId: string, accessDays: number) {
  if (!courseId) throw new Error('Pick a course.');
  const days = Math.round(Number(accessDays) || 0);
  if (days < 0 || days > 3650) throw new Error('Course length must be between 1 and 3650 days.');
  const all = await listDayPlans();
  if (days === 0) delete all[courseId];
  else all[courseId] = { accessDays: days };
  await kvSet(DAY_PLANS_KEY, all);
  if (days > 0) await clearTimeline(courseId);
  return days ? { accessDays: days } : null;
}

/**
 * The timeline one student works against. Day-wise courses (a course length, or days on the lessons)
 * count from the student's enrollment; older courses use their four fixed dates. Null when neither is set.
 */
export async function timelineFor(studentId: string, courseId: string, lessonDaysTotal = 0): Promise<{ dates: TimelineDates; mode: 'days' | 'dates'; enrolledAt: number } | null> {
  const plan = await getDayPlan(courseId);
  const accessDays = plan?.accessDays || lessonDaysTotal;
  if (accessDays > 0) {
    const enrolledAt = await enrollmentDate(studentId, courseId);
    return {
      mode: 'days',
      enrolledAt,
      dates: { firstEnrolled: enrolledAt, lastEnrolled: enrolledAt, lastCounting: enrolledAt, courseEnding: enrolledAt + accessDays * DAY },
    };
  }
  const fixed = await getTimeline(courseId);
  return fixed ? { mode: 'dates', enrolledAt: await enrollmentDate(studentId, courseId), dates: fixed.dates } : null;
}
