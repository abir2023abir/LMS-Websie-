import { kvGet, kvSet } from '@/lib/kv-store';
import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import { getFallbackCourseData } from '@/lib/progress';
import { listQuizzes, listAttempts } from '@/lib/quizzes';
import { listAssignments, listSubmissions } from '@/lib/assignments';
import { attemptsFor, listExams } from '@/lib/exams';
import { listLiveClasses } from '@/lib/live-classes';

/*
 * Strict module path. Inside a module the lessons are watched in order; the module's quizzes,
 * assignments, exams and live classes stay locked until every lesson of the module is watched,
 * then open one at a time (quiz, assignment, exam, live class, or instructor approval when the
 * module has no live class). The next module opens only when the whole module is done.
 */

export type StepKey = 'video' | 'quiz' | 'assignment' | 'exam' | 'live' | 'approval';
export type StepState = 'done' | 'current' | 'locked';
export type Step = { key: StepKey; label: string; state: StepState; detail: string };
export type LessonProgress = {
  lessonId: string; lessonTitle: string; moduleId: string; moduleTitle: string;
  state: 'done' | 'current' | 'locked';
  steps: Step[];
  pendingRequest: boolean;
  hint: string; // what to do next when no step is open yet
  moduleLessons: number;
  moduleWatched: number;
};

const VIDEO_KEY = 'lesson-video-done';
const APPROVALS_KEY = 'lesson-approvals';
const REQUESTS_KEY = 'progress-requests';

/* ── course structure (cached for 30 s: it changes rarely and every progress check needs it) ── */
type CourseShape = { title: string; lessons: { lessonId: string; lessonTitle: string; moduleId: string; moduleTitle: string }[] };
const shapeCache = new Map<string, { at: number; value: Promise<CourseShape> }>();

export function courseLessons(courseId: string): Promise<CourseShape> {
  const hit = shapeCache.get(courseId);
  if (hit && Date.now() - hit.at < 30000) return hit.value;
  const value = loadCourseLessons(courseId);
  shapeCache.set(courseId, { at: Date.now(), value });
  value.catch(() => shapeCache.delete(courseId));
  return value;
}

async function loadCourseLessons(courseId: string): Promise<CourseShape> {
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
type RawStep = { key: StepKey; label: string; done: boolean; detail: string };

export async function courseProgress(studentId: string, courseId: string): Promise<{ courseTitle: string; lessons: LessonProgress[]; percent: number; currentLessonId: string }> {
  const [{ title, lessons }, videoAll, approvalsAll, quizzes, quizAttempts, assignments, submissions, exams, examAttempts, lives, requests] = await Promise.all([
    courseLessons(courseId), kvGet<CourseSets>(VIDEO_KEY, {}), kvGet<CourseSets>(APPROVALS_KEY, {}),
    listQuizzes(), listAttempts(studentId), listAssignments(), listSubmissions(), listExams(), attemptsFor(studentId), listLiveClasses(), listRequests(),
  ]);
  const videos = new Set(videoAll[studentId]?.[courseId] || []);
  const approvals = new Set(approvalsAll[studentId]?.[courseId] || []);

  // Lessons grouped by module (the list is already in course order).
  const groups: number[][] = [];
  lessons.forEach((lesson, index) => {
    const last = groups[groups.length - 1];
    if (last && lessons[last[0]].moduleId === lesson.moduleId) last.push(index);
    else groups.push([index]);
  });
  const lastLessonOfModule = new Map<string, string>();
  lessons.forEach((lesson) => lastLessonOfModule.set(lesson.moduleId, lesson.lessonId));

  // What each lesson asks of the student (before locking is applied).
  const raws: RawStep[][] = lessons.map((lesson) => {
    const lessonQuizzes = quizzes.filter((q) => q.published && q.courseId === courseId && q.lessonId === lesson.lessonId);
    const lessonAssignments = assignments.filter((a) => a.published && a.courseId === courseId && a.lessonId === lesson.lessonId);
    // A module-level exam (no lesson) is a step of the module's last lesson.
    const lessonExams = exams.filter((e) => e.published && e.courseId === courseId && (e.lessonId === lesson.lessonId || (!e.lessonId && e.moduleId === lesson.moduleId && lastLessonOfModule.get(lesson.moduleId) === lesson.lessonId)));
    const lessonLives = lives.filter((l) => l.published && l.courseId === courseId && l.lessonId === lesson.lessonId);

    const raw: RawStep[] = [{ key: 'video', label: 'Watch the lesson', done: videos.has(lesson.lessonId), detail: 'Watch at least 80% of the video' }];
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
    }
    return raw;
  });

  // A module with no live class ends with instructor approval (except the very last lesson of the course).
  groups.forEach((group) => {
    const last = group[group.length - 1];
    const hasLive = group.some((i) => raws[i].some((step) => step.key === 'live'));
    if (!hasLive && last !== lessons.length - 1) {
      raws[last].push({ key: 'approval', label: 'Instructor approval', done: approvals.has(lessons[last].lessonId), detail: 'Ask your instructor to open the next module' });
    }
  });

  /*
   * Module rules:
   *  1. The lessons of a module are watched in order (lesson 2 opens once lesson 1's video is done).
   *  2. Quizzes, assignments, exams and live classes of the module stay locked until EVERY lesson
   *     of the module has been watched; after that they open one at a time, in order.
   *  3. The next module opens only when everything in the module is done.
   */
  const result: LessonProgress[] = new Array(lessons.length);
  let unlocked: boolean = true;
  for (const group of groups) {
    const moduleOpen: boolean = unlocked;
    const count = group.length;
    const watched = group.filter((i) => videos.has(lessons[i].lessonId) || approvals.has(lessons[i].lessonId)).length;
    const allWatched = watched === count;
    let chainOpen = allWatched;
    let earlierWatched = true;

    group.forEach((i) => {
      const lesson = lessons[i];
      const forced = approvals.has(lesson.lessonId); // an approval also unlocks the whole lesson by hand
      const lessonOpen = moduleOpen && earlierWatched;
      earlierWatched = earlierWatched && (videos.has(lesson.lessonId) || forced);

      const steps: Step[] = raws[i].map((step) => {
        const done = step.done || forced;
        let state: StepState = 'locked';
        if (step.key === 'video') {
          state = !lessonOpen ? 'locked' : done ? 'done' : 'current';
        } else if (moduleOpen && chainOpen) {
          if (done) state = 'done';
          else { state = 'current'; chainOpen = false; }
        }
        const detail = step.key !== 'video' && state === 'locked' && !allWatched && count > 1
          ? `Watch all ${count} lessons of this module first (${watched} of ${count} watched)`
          : step.detail;
        return { key: step.key, label: step.label, state, detail };
      });

      const allDone = steps.every((step) => step.state === 'done');
      const state: LessonProgress['state'] = !lessonOpen ? 'locked' : allDone ? 'done' : 'current';
      let hint = '';
      if (state === 'current' && !steps.some((step) => step.state === 'current')) {
        hint = !allWatched
          ? `Next, watch the remaining ${count - watched} lesson${count - watched === 1 ? '' : 's'} of this module. The quizzes and assignments open once every lesson is watched.`
          : 'Finish the earlier steps of this module first.';
      }
      result[i] = {
        ...lesson, state, steps, hint, moduleLessons: count, moduleWatched: watched,
        pendingRequest: requests.some((r) => r.studentId === studentId && r.courseId === courseId && r.lessonId === lesson.lessonId && r.status === 'pending'),
      };
    });
    unlocked = moduleOpen && group.every((i) => result[i].state === 'done');
  }

  const doneCount = result.filter((lesson) => lesson.state === 'done').length;
  const current = result.find((lesson) => lesson.steps.some((step) => step.state === 'current')) || result.find((lesson) => lesson.state === 'current');
  return {
    courseTitle: title,
    lessons: result,
    percent: result.length ? Math.round((doneCount / result.length) * 100) : 0,
    currentLessonId: current?.lessonId || result[result.length - 1]?.lessonId || '',
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
