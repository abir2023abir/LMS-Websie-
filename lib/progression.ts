import { kvGet, kvSet } from '@/lib/kv-store';
import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import { getFallbackCourseData } from '@/lib/progress';
import { listQuizzes, listAttempts } from '@/lib/quizzes';
import { listAssignments, listSubmissions } from '@/lib/assignments';
import { attemptsFor, listExams } from '@/lib/exams';
import { listLiveClasses } from '@/lib/live-classes';

/*
 * Strict lesson path. Inside every lesson the steps run in this order, and each
 * step stays locked until the one before it is done:
 *   video (80% watched) → quiz (passed) → assignment (submitted) → exam (passed)
 *   → live class (attendance marked)  — or, if the lesson has no live class,
 *     instructor/admin approval to move on.
 * The next lesson opens only when every step of the previous lesson is done.
 * Steps a lesson doesn't have are skipped.
 */

export type StepKey = 'video' | 'quiz' | 'assignment' | 'exam' | 'live' | 'approval';
export type StepState = 'done' | 'current' | 'locked';
export type Step = { key: StepKey; label: string; state: StepState; detail: string };
export type LessonProgress = {
  lessonId: string; lessonTitle: string; moduleId: string; moduleTitle: string;
  state: 'done' | 'current' | 'locked';
  steps: Step[];
  pendingRequest: boolean;
};

const VIDEO_KEY = 'lesson-video-done';
const APPROVALS_KEY = 'lesson-approvals';
const REQUESTS_KEY = 'progress-requests';

/* ── course structure ── */
export async function courseLessons(courseId: string) {
  let course = await getCourseById(courseId).catch(() => null);
  if (!course?.modules?.length && featuredCourses.some((c) => c.id === courseId)) course = getFallbackCourseData(courseId);
  const modules = course?.modules?.length ? course.modules : getFallbackCourseData(courseId)?.modules || [];
  return {
    title: course?.title || '',
    lessons: modules.flatMap((mod) => (mod.lessons || []).map((lesson) => ({ lessonId: lesson.id, lessonTitle: lesson.title, moduleId: mod.id, moduleTitle: mod.title }))),
  };
}

/* ── video completion (reported by the classroom player) ── */
type CourseSets = Record<string, Record<string, string[]>>; // studentId → courseId → lessonIds

export async function markVideoDone(studentId: string, courseId: string, lessonId: string) {
  const all = await kvGet<CourseSets>(VIDEO_KEY, {});
  const current = all[studentId]?.[courseId] || [];
  if (current.includes(lessonId)) return;
  await kvSet(VIDEO_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: [...current, lessonId] } });
}

/* ── approvals: instructor/admin let a student past a lesson (or unlock it manually) ── */
export async function approveLesson(studentId: string, courseId: string, lessonId: string) {
  const all = await kvGet<CourseSets>(APPROVALS_KEY, {});
  const current = all[studentId]?.[courseId] || [];
  if (current.includes(lessonId)) return;
  await kvSet(APPROVALS_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: [...current, lessonId] } });
}

export type ProgressRequest = {
  id: string; studentId: string; studentName: string; studentEmail: string;
  courseId: string; courseTitle: string; lessonId: string; lessonTitle: string; nextLessonTitle: string;
  message: string; status: 'pending' | 'approved' | 'rejected'; decidedBy: string; reply: string;
  createdAt: string; decidedAt: string;
};

export async function listRequests(): Promise<ProgressRequest[]> {
  const list = await kvGet<ProgressRequest[]>(REQUESTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function createRequest(input: Omit<ProgressRequest, 'id' | 'status' | 'decidedBy' | 'reply' | 'createdAt' | 'decidedAt'>) {
  const list = await listRequests();
  if (list.some((item) => item.studentId === input.studentId && item.courseId === input.courseId && item.lessonId === input.lessonId && item.status === 'pending')) {
    throw new Error('You already asked to move on from this lesson. Your instructor will reply soon.');
  }
  const request: ProgressRequest = {
    ...input, message: input.message.trim().slice(0, 800),
    id: `req-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending', decidedBy: '', reply: '', createdAt: new Date().toISOString(), decidedAt: '',
  };
  await kvSet(REQUESTS_KEY, [request, ...list]);
  return request;
}

export async function decideRequest(id: string, status: 'approved' | 'rejected', decidedBy: string, reply: string) {
  const list = await listRequests();
  const request = list.find((item) => item.id === id);
  if (!request) throw new Error('Request not found.');
  const next = { ...request, status, decidedBy, reply: reply.trim().slice(0, 800), decidedAt: new Date().toISOString() };
  await kvSet(REQUESTS_KEY, list.map((item) => (item.id === id ? next : item)));
  if (status === 'approved') await approveLesson(request.studentId, request.courseId, request.lessonId);
  return next;
}

/* ── the engine ── */
export async function courseProgress(studentId: string, courseId: string): Promise<{ courseTitle: string; lessons: LessonProgress[]; percent: number; currentLessonId: string }> {
  const [{ title, lessons }, videoAll, approvalsAll, quizzes, quizAttempts, assignments, submissions, exams, examAttempts, lives, requests] = await Promise.all([
    courseLessons(courseId), kvGet<CourseSets>(VIDEO_KEY, {}), kvGet<CourseSets>(APPROVALS_KEY, {}),
    listQuizzes(), listAttempts(studentId), listAssignments(), listSubmissions(), listExams(), attemptsFor(studentId), listLiveClasses(), listRequests(),
  ]);
  const videos = new Set(videoAll[studentId]?.[courseId] || []);
  const approvals = new Set(approvalsAll[studentId]?.[courseId] || []);

  // A module-level exam (no lesson) is a step of the module's last lesson.
  const lastLessonOfModule = new Map<string, string>();
  lessons.forEach((lesson) => lastLessonOfModule.set(lesson.moduleId, lesson.lessonId));

  let unlocked = true;
  let currentLessonId = '';
  const result: LessonProgress[] = lessons.map((lesson, index) => {
    const isLast = index === lessons.length - 1;
    const lessonQuizzes = quizzes.filter((q) => q.published && q.courseId === courseId && q.lessonId === lesson.lessonId);
    const lessonAssignments = assignments.filter((a) => a.published && a.courseId === courseId && a.lessonId === lesson.lessonId);
    const lessonExams = exams.filter((e) => e.published && e.courseId === courseId && (e.lessonId === lesson.lessonId || (!e.lessonId && e.moduleId === lesson.moduleId && lastLessonOfModule.get(lesson.moduleId) === lesson.lessonId)));
    const lessonLives = lives.filter((l) => l.published && l.courseId === courseId && l.lessonId === lesson.lessonId);

    const raw: { key: StepKey; label: string; done: boolean; detail: string }[] = [
      { key: 'video', label: 'Watch the lesson', done: videos.has(lesson.lessonId), detail: 'Watch at least 80% of the video' },
    ];
    if (lessonQuizzes.length) {
      const passed = lessonQuizzes.filter((q) => quizAttempts.some((a) => a.quizId === q.id && a.passed)).length;
      raw.push({ key: 'quiz', label: 'Pass the quiz', done: passed === lessonQuizzes.length, detail: `${passed} of ${lessonQuizzes.length} passed` });
    }
    if (lessonAssignments.length) {
      const sent = lessonAssignments.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.studentId === studentId)).length;
      raw.push({ key: 'assignment', label: 'Submit the assignment', done: sent === lessonAssignments.length, detail: `${sent} of ${lessonAssignments.length} submitted` });
    }
    if (lessonExams.length) {
      const passed = lessonExams.filter((e) => examAttempts.some((a) => a.examId === e.id && a.status === 'submitted' && a.passed)).length;
      raw.push({ key: 'exam', label: 'Pass the exam', done: passed === lessonExams.length, detail: `${passed} of ${lessonExams.length} passed` });
    }
    if (lessonLives.length) {
      const attended = lessonLives.some((l) => l.attendees.includes(studentId));
      raw.push({ key: 'live', label: 'Attend the live class', done: attended || approvals.has(lesson.lessonId), detail: attended ? 'Attendance marked' : 'Attendance is marked by your instructor' });
    } else if (!isLast) {
      raw.push({ key: 'approval', label: 'Instructor approval', done: approvals.has(lesson.lessonId), detail: 'Ask your instructor to open the next lesson' });
    }

    // An admin/instructor approval also counts as a manual unlock of the whole lesson.
    const forced = approvals.has(lesson.lessonId);
    const lessonOpen = unlocked;
    let reachedCurrent = false;
    const steps: Step[] = raw.map((step) => {
      const done = step.done || forced;
      let state: StepState = 'locked';
      if (lessonOpen && done && !reachedCurrent) state = 'done';
      else if (lessonOpen && !reachedCurrent) { state = 'current'; reachedCurrent = true; }
      return { key: step.key, label: step.label, state, detail: step.detail };
    });
    const allDone = steps.every((step) => step.state === 'done');
    const state: LessonProgress['state'] = !lessonOpen ? 'locked' : allDone ? 'done' : 'current';
    if (state === 'current' && !currentLessonId) currentLessonId = lesson.lessonId;
    unlocked = lessonOpen && allDone;
    return {
      ...lesson, state, steps,
      pendingRequest: requests.some((r) => r.studentId === studentId && r.courseId === courseId && r.lessonId === lesson.lessonId && r.status === 'pending'),
    };
  });

  const doneCount = result.filter((lesson) => lesson.state === 'done').length;
  return {
    courseTitle: title,
    lessons: result,
    percent: result.length ? Math.round((doneCount / result.length) * 100) : 0,
    currentLessonId: currentLessonId || result[result.length - 1]?.lessonId || '',
  };
}

/** Is the given step of a lesson open for this student? Used to lock the APIs. */
export async function stepOpen(studentId: string, courseId: string, lessonId: string, key: StepKey) {
  const { lessons } = await courseProgress(studentId, courseId);
  const lesson = lessons.find((item) => item.lessonId === lessonId);
  if (!lesson || lesson.state === 'locked') return false;
  const step = lesson.steps.find((item) => item.key === key);
  return step ? step.state !== 'locked' : true;
}

export async function lessonOpen(studentId: string, courseId: string, lessonId: string) {
  const { lessons } = await courseProgress(studentId, courseId);
  const lesson = lessons.find((item) => item.lessonId === lessonId);
  return Boolean(lesson && lesson.state !== 'locked');
}
