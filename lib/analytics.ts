import { listProfiles, listCourseSettings } from '@/lib/accounts';
import { getCoursesByInstructor } from '@/lib/db';
import { allEnrollments } from '@/lib/payments';
import { courseProgress, listRequests } from '@/lib/progression';
import { listAttempts } from '@/lib/quizzes';
import { attemptsFor } from '@/lib/exams';
import { listSubmissions } from '@/lib/assignments';
import { listLiveClasses } from '@/lib/live-classes';
import type { staffIdentity } from '@/lib/user-session';

type Staff = NonNullable<Awaited<ReturnType<typeof staffIdentity>>>;

/** Course ids a staff member may see: admins → all (null); mentors → courses they teach or mentor. */
export async function staffCourses(staff: Staff): Promise<Set<string> | null> {
  if (staff.admin) return null;
  const [owned, settings] = await Promise.all([getCoursesByInstructor(staff.profile.id), listCourseSettings()]);
  return new Set([
    ...owned.map((course) => String(course.id || '')),
    ...settings.filter((row) => String(row.mentor_email || '').toLowerCase() === staff.profile.email.toLowerCase()).map((row) => row.course_id),
  ]);
}

export type StudentRow = {
  studentId: string; name: string; email: string;
  percent: number; lessonsDone: number; lessonsTotal: number; currentLesson: string; currentStep: string;
  quizAverage: number | null; examAverage: number | null; assignmentsSubmitted: number;
  lastActive: string; atRisk: boolean; score: number;
  timelineStatus: 'none' | 'on-track' | 'at-risk' | 'expired' | 'completed'; dueAt: string; endingAt: string;
  lessons: { module: string; title: string; state: 'done' | 'current' | 'locked' }[];
};

const DAY = 24 * 60 * 60 * 1000;
const average = (list: number[]) => (list.length ? Math.round(list.reduce((sum, value) => sum + value, 0) / list.length) : null);
const analyticsCache = new Map<string, { at: number; value: Awaited<ReturnType<typeof computeCourseAnalytics>> }>();

/** Everything the analytics dashboard shows for one course, computed in one pass. Repeated live polls reuse the last result for a few seconds. */
export async function courseAnalytics(courseId: string) {
  const hit = analyticsCache.get(courseId);
  if (hit && Date.now() - hit.at < 4000) return hit.value;
  const value = await computeCourseAnalytics(courseId);
  analyticsCache.set(courseId, { at: Date.now(), value });
  return value;
}

async function computeCourseAnalytics(courseId: string) {
  const [enrollments, profiles, submissions, lives, requests] = await Promise.all([allEnrollments(), listProfiles(), listSubmissions(), listLiveClasses(), listRequests()]);
  const profileIds = new Set(profiles.map((profile) => profile.id));
  const studentIds = Object.entries(enrollments).filter(([, courses]) => courses.includes(courseId)).map(([id]) => id)
    .filter((id) => profileIds.has(id));

  const perStudent = await Promise.all(studentIds.map(async (studentId) => {
    const profile = profiles.find((item) => item.id === studentId)!;
    const [progress, quizzes, exams] = await Promise.all([courseProgress(studentId, courseId), listAttempts(studentId), attemptsFor(studentId)]);
    const courseQuizzes = quizzes.filter((attempt) => attempt.courseId === courseId);
    const courseExams = exams.filter((attempt) => attempt.courseId === courseId && attempt.status === 'submitted');
    const mySubmissions = submissions.filter((item) => item.studentId === studentId && item.courseId === courseId);
    const lastActive = [...courseQuizzes.map((a) => a.at), ...courseExams.map((a) => a.submittedAt), ...mySubmissions.map((s) => s.submittedAt), profile.created_at]
      .filter(Boolean).sort().pop() || '';
    const current = progress.lessons.find((lesson) => lesson.lessonId === progress.currentLessonId);
    const quizAverage = average(courseQuizzes.map((a) => a.percent));
    const examAverage = average(courseExams.map((a) => a.percent));
    const row: StudentRow = {
      studentId, name: profile.name, email: profile.email,
      percent: progress.percent,
      lessonsDone: progress.lessons.filter((lesson) => lesson.state === 'done').length,
      lessonsTotal: progress.lessons.length,
      currentLesson: progress.percent === 100 ? 'Finished' : current?.lessonTitle || '',
      currentStep: progress.percent === 100 ? '' : current?.steps.find((step) => step.state === 'current')?.label || '',
      quizAverage, examAverage,
      assignmentsSubmitted: mySubmissions.length,
      lastActive,
      atRisk: progress.percent < 100 && (!lastActive || Date.now() - new Date(lastActive).getTime() > 7 * DAY),
      score: progress.percent * 100 + (examAverage ?? 0) * 2 + (quizAverage ?? 0),
      timelineStatus: progress.timeline.status, dueAt: current?.dueAt || '', endingAt: progress.timeline.endingAt,
      lessons: progress.lessons.map((lesson) => ({ module: lesson.moduleTitle, title: lesson.lessonTitle, state: lesson.state })),
    };
    return { row, progress, quizzes: courseQuizzes, exams: courseExams };
  }));

  const rows = perStudent.map((item) => item.row).sort((a, b) => b.score - a.score);
  const lessons = perStudent[0]?.progress.lessons || [];

  // How many students have finished each lesson, and how many are on it now — shows where people drop off.
  const funnel = lessons.map((lesson, index) => ({
    lesson: `${index + 1}. ${lesson.lessonTitle}`.slice(0, 40),
    module: lesson.moduleTitle,
    completed: perStudent.filter((item) => item.progress.lessons[index]?.state === 'done').length,
    current: perStudent.filter((item) => item.progress.lessons[index]?.state === 'current').length,
  }));

  const buckets = [
    { range: '0–24%', min: 0, max: 24 }, { range: '25–49%', min: 25, max: 49 }, { range: '50–74%', min: 50, max: 74 },
    { range: '75–99%', min: 75, max: 99 }, { range: 'Finished', min: 100, max: 100 },
  ].map((bucket) => ({ range: bucket.range, students: rows.filter((row) => row.percent >= bucket.min && row.percent <= bucket.max).length }));

  const allQuizzes = perStudent.flatMap((item) => item.quizzes);
  const allExams = perStudent.flatMap((item) => item.exams);
  const courseLives = lives.filter((live) => live.courseId === courseId && new Date(live.startsAt).getTime() < Date.now());
  const seats = courseLives.length * Math.max(1, rows.length);
  const attended = courseLives.reduce((sum, live) => sum + live.attendees.filter((id) => studentIds.includes(id)).length, 0);
  const courseSubmissions = submissions.filter((item) => item.courseId === courseId);

  return {
    summary: {
      students: rows.length,
      averageProgress: average(rows.map((row) => row.percent)) ?? 0,
      finished: rows.filter((row) => row.percent === 100).length,
      activeThisWeek: rows.filter((row) => row.lastActive && Date.now() - new Date(row.lastActive).getTime() <= 7 * DAY).length,
      atRisk: rows.filter((row) => row.atRisk).length,
      quizPassRate: allQuizzes.length ? Math.round((allQuizzes.filter((a) => a.passed).length / allQuizzes.length) * 100) : null,
      examPassRate: allExams.length ? Math.round((allExams.filter((a) => a.passed).length / allExams.length) * 100) : null,
      toReview: courseSubmissions.filter((item) => item.status === 'submitted').length,
      pendingRequests: requests.filter((item) => item.courseId === courseId && item.status === 'pending').length,
      attendanceRate: courseLives.length && rows.length ? Math.round((attended / seats) * 100) : null,
    },
    funnel,
    buckets,
    rows,
  };
}
