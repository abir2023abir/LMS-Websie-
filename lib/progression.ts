import { kvGet, kvSet } from '@/lib/kv-store';
import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import { getFallbackCourseData } from '@/lib/progress';
import { listQuizzes, listAttempts } from '@/lib/quizzes';
import { listAssignments, listSubmissions } from '@/lib/assignments';
import { attemptsFor, listExams } from '@/lib/exams';
import { listCourseEdits } from '@/lib/course-edits';
import { endingOverride, enrollmentDate, extendCourseEnding, getTimeline } from '@/lib/course-timeline';
import { dynamicAllocation, initialAllocation, minimumLessonTime, timelineState, type TimelineStatus } from '@/lib/timeline-math';

/*
 * The lesson path, following the timeline document.
 *
 * Every lesson has up to six parts:
 *   Stage 1  Overview and Videos open together.
 *   Stage 2  Overview done AND Videos done  -> the Quiz opens.
 *   Stage 3  Quiz passed                    -> Notes and the Assignment open.
 *   Stage 4  The first five parts done      -> the Exam opens.
 * A part with nothing in it (no overview text, no notes, no quiz...) is skipped. Opening a tab
 * never completes a part. The next lesson opens when the whole lesson is done.
 *
 * Live classes are NOT part of this path: a student can always join one, even when behind.
 */

export type StepKey = 'overview' | 'video' | 'quiz' | 'notes' | 'assignment' | 'exam';
export type StepState = 'done' | 'current' | 'locked';
export type Step = { key: StepKey; label: string; state: StepState; detail: string };
export type LessonProgress = {
  lessonId: string; lessonTitle: string; moduleId: string; moduleTitle: string;
  state: 'done' | 'current' | 'locked';
  steps: Step[];
  hint: string; // why a locked lesson is locked
  dueAt: string; // when the current lesson should be finished by ('' = no timeline or not the current lesson)
  allocationHours: number;
  rescheduled: number; // how many times the due date was recalculated after it passed
  pendingExtension: boolean;
};
export type CourseTimeline = {
  configured: boolean;
  status: TimelineStatus | 'none';
  minimumHours: number;
  allocationHours: number;
  remainingDays: number;
  projectedCompletion: string;
  endingAt: string;
  enrolledAt: string;
  warning: string;
};

const VIDEO_KEY = 'lesson-video-done';
const PARTS_KEY = 'lesson-parts'; // studentId → courseId → lessonId → part → ISO time
const APPROVALS_KEY = 'lesson-approvals';
const REQUESTS_KEY = 'progress-requests';
const WINDOWS_KEY = 'lesson-windows'; // studentId → courseId → lessonId → the lesson's time window
const HOUR = 3600000;

/* ── course structure (cached for 30 s: it changes rarely and every progress check needs it) ── */
type LessonShape = { lessonId: string; lessonTitle: string; moduleId: string; moduleTitle: string; overview: string; notes: string };
type CourseShape = { title: string; lessons: LessonShape[] };
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
  let modules = course?.modules?.length ? course.modules : getFallbackCourseData(courseId)?.modules || [];
  // Lessons, titles, overview and notes the admin changed in the course editor.
  const edit = (await listCourseEdits().catch(() => ({} as Record<string, { title?: string; modules?: typeof modules }>)))[courseId];
  if (Array.isArray(edit?.modules) && edit.modules.length) modules = edit.modules;
  return {
    title: edit?.title || course?.title || '',
    lessons: modules.flatMap((mod) => (mod.lessons || []).map((lesson) => ({
      lessonId: lesson.id, lessonTitle: lesson.title, moduleId: mod.id, moduleTitle: mod.title,
      overview: String(lesson.overview || '').trim(), notes: String(lesson.notes || '').trim(),
    }))),
  };
}

/* ── what the student has completed ── */
type CourseSets = Record<string, Record<string, string[]>>; // studentId → courseId → lessonIds
type PartMap = Record<string, Record<string, Record<string, Record<string, string>>>>;

export async function markVideoDone(studentId: string, courseId: string, lessonId: string) {
  const all = await kvGet<CourseSets>(VIDEO_KEY, {});
  const current = all[studentId]?.[courseId] || [];
  if (current.includes(lessonId)) return;
  await kvSet(VIDEO_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: [...current, lessonId] } });
}

/** The student confirms they read the overview or the notes (an explicit action, never just opening the tab). */
export async function markPartDone(studentId: string, courseId: string, lessonId: string, part: 'overview' | 'notes') {
  const all = await kvGet<PartMap>(PARTS_KEY, {});
  if (all[studentId]?.[courseId]?.[lessonId]?.[part]) return;
  const mine = all[studentId] || {};
  const course = mine[courseId] || {};
  await kvSet(PARTS_KEY, { ...all, [studentId]: { ...mine, [courseId]: { ...course, [lessonId]: { ...course[lessonId], [part]: new Date().toISOString() } } } });
}

/* ── approvals: instructor/admin let a student past a lesson (or unlock it manually) ── */
export async function approveLesson(studentId: string, courseId: string, lessonId: string) {
  const all = await kvGet<CourseSets>(APPROVALS_KEY, {});
  const current = all[studentId]?.[courseId] || [];
  if (current.includes(lessonId)) return;
  await kvSet(APPROVALS_KEY, { ...all, [studentId]: { ...all[studentId], [courseId]: [...current, lessonId] } });
}

/** Admin extension: moves one student's course ending date later. */
export async function extendCourse(studentId: string, courseId: string, days: number) {
  return extendCourseEnding(studentId, courseId, days);
}

export type ProgressRequest = {
  id: string; studentId: string; studentName: string; studentEmail: string;
  courseId: string; courseTitle: string; lessonId: string; lessonTitle: string; nextLessonTitle: string;
  message: string; status: 'pending' | 'approved' | 'rejected'; decidedBy: string; reply: string;
  createdAt: string; decidedAt: string;
  kind?: 'move-on' | 'extension'; // older requests have no kind and are "move-on"
  days?: number; // extension: days added when approved
};

export async function listRequests(): Promise<ProgressRequest[]> {
  const list = await kvGet<ProgressRequest[]>(REQUESTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function createRequest(input: Omit<ProgressRequest, 'id' | 'status' | 'decidedBy' | 'reply' | 'createdAt' | 'decidedAt' | 'days'>) {
  const list = await listRequests();
  const kind = input.kind || 'move-on';
  if (list.some((item) => item.studentId === input.studentId && item.courseId === input.courseId && item.status === 'pending' && (item.kind || 'move-on') === kind && (kind === 'extension' || item.lessonId === input.lessonId))) {
    throw new Error('You already asked for this. Your instructor will reply soon.');
  }
  const request: ProgressRequest = {
    ...input, message: input.message.trim().slice(0, 800),
    id: `req-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending', decidedBy: '', reply: '', createdAt: new Date().toISOString(), decidedAt: '',
  };
  await kvSet(REQUESTS_KEY, [request, ...list]);
  return request;
}

export async function decideRequest(id: string, status: 'approved' | 'rejected', decidedBy: string, reply: string, days = 2) {
  const list = await listRequests();
  const request = list.find((item) => item.id === id);
  if (!request) throw new Error('Request not found.');
  const extension = request.kind === 'extension';
  const added = extension && status === 'approved' ? Math.max(1, Math.min(365, Math.round(Number(days) || 2))) : undefined;
  const next = { ...request, status, decidedBy, reply: reply.trim().slice(0, 800), decidedAt: new Date().toISOString(), ...(added ? { days: added } : {}) };
  await kvSet(REQUESTS_KEY, list.map((item) => (item.id === id ? next : item)));
  if (status === 'approved') {
    if (extension) {
      if (added) await extendCourse(request.studentId, request.courseId, added);
    } else {
      await approveLesson(request.studentId, request.courseId, request.lessonId);
    }
  }
  return next;
}

/* ── the engine ── */
type RawStep = { key: StepKey; label: string; done: boolean; detail: string };
type Window = { startedAt: string; allocMs: number; completedAt?: string; reschedules?: number };
type WindowMap = Record<string, Record<string, Record<string, Window>>>;

export async function courseProgress(studentId: string, courseId: string, options: { sync?: boolean } = {}): Promise<{
  courseTitle: string; lessons: LessonProgress[]; percent: number; currentLessonId: string; timeline: CourseTimeline;
  finalExam: { total: number; passed: number; open: boolean };
}> {
  const [{ title, lessons }, videoAll, partsAll, approvalsAll, quizzes, quizAttempts, assignments, submissions, exams, examAttempts, requests, windowsAll, timeline] = await Promise.all([
    courseLessons(courseId), kvGet<CourseSets>(VIDEO_KEY, {}), kvGet<PartMap>(PARTS_KEY, {}), kvGet<CourseSets>(APPROVALS_KEY, {}),
    listQuizzes(), listAttempts(studentId), listAssignments(), listSubmissions(), listExams(), attemptsFor(studentId), listRequests(),
    kvGet<WindowMap>(WINDOWS_KEY, {}), getTimeline(courseId),
  ]);
  const videos = new Set(videoAll[studentId]?.[courseId] || []);
  const parts = partsAll[studentId]?.[courseId] || {};
  const approvals = new Set(approvalsAll[studentId]?.[courseId] || []);
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // The last lesson of each module (a module-level exam is a part of it).
  const lastLessonOfModule = new Map<string, string>();
  lessons.forEach((lesson) => lastLessonOfModule.set(lesson.moduleId, lesson.lessonId));

  const result: LessonProgress[] = [];
  let previousDone = true;
  lessons.forEach((lesson) => {
    const lessonQuizzes = quizzes.filter((q) => q.published && q.courseId === courseId && q.lessonId === lesson.lessonId);
    const lessonAssignments = assignments.filter((a) => a.published && a.courseId === courseId && a.lessonId === lesson.lessonId);
    const lessonExams = exams.filter((e) => e.published && e.courseId === courseId && (e.lessonId === lesson.lessonId || (!e.lessonId && e.moduleId === lesson.moduleId && lastLessonOfModule.get(lesson.moduleId) === lesson.lessonId)));
    const forced = approvals.has(lesson.lessonId); // an approval opens and completes the whole lesson by hand
    const mine = parts[lesson.lessonId] || {};

    const overview: RawStep | null = lesson.overview ? { key: 'overview', label: 'Read the overview', done: Boolean(mine.overview), detail: mine.overview ? 'Marked as read' : 'Read it, then mark it as read' } : null;
    const video: RawStep = { key: 'video', label: 'Watch the video', done: videos.has(lesson.lessonId), detail: 'Watch at least 80% of the video' };
    let quiz: RawStep | null = null;
    if (lessonQuizzes.length) {
      const passed = lessonQuizzes.filter((q) => quizAttempts.some((a) => a.quizId === q.id && a.passed)).length;
      quiz = { key: 'quiz', label: 'Pass the quiz', done: passed === lessonQuizzes.length, detail: `${passed} of ${lessonQuizzes.length} passed` };
    }
    const notes: RawStep | null = lesson.notes ? { key: 'notes', label: 'Read the notes', done: Boolean(mine.notes), detail: mine.notes ? 'Marked as read' : 'Read them, then mark them as read' } : null;
    let assignment: RawStep | null = null;
    if (lessonAssignments.length) {
      const sent = lessonAssignments.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.studentId === studentId)).length;
      assignment = { key: 'assignment', label: 'Submit the assignment', done: sent === lessonAssignments.length, detail: `${sent} of ${lessonAssignments.length} submitted` };
    }
    let exam: RawStep | null = null;
    if (lessonExams.length) {
      const passed = lessonExams.filter((e) => examAttempts.some((a) => a.examId === e.id && a.status === 'submitted' && a.passed)).length;
      exam = { key: 'exam', label: 'Pass the exam', done: passed === lessonExams.length, detail: `${passed} of ${lessonExams.length} passed` };
    }

    const lessonOpen = previousDone;
    const finished = (step: RawStep | null) => !step || step.done || forced;
    const stage1 = finished(overview) && finished(video); // overview + video
    const stage2 = stage1 && finished(quiz); // quiz passed
    const stage3 = stage2 && finished(notes) && finished(assignment); // notes + assignment
    // Which parts are open, by the document's stages.
    const open: Record<StepKey, boolean> = {
      overview: lessonOpen, video: lessonOpen,
      quiz: lessonOpen && stage1,
      notes: lessonOpen && stage2, assignment: lessonOpen && stage2,
      exam: lessonOpen && stage3,
    };
    const why: Record<StepKey, string> = {
      overview: '', video: '',
      quiz: 'Opens after the overview and the video are done',
      notes: 'Opens after the quiz is passed', assignment: 'Opens after the quiz is passed',
      exam: 'Opens after every other part is done',
    };

    const steps: Step[] = ([overview, video, quiz, notes, assignment, exam].filter(Boolean) as RawStep[]).map((step) => {
      const done = step.done || forced;
      const state: StepState = !open[step.key] ? 'locked' : done ? 'done' : 'current';
      return { key: step.key, label: step.label, state, detail: state === 'locked' ? (lessonOpen ? why[step.key] : 'Finish the previous lesson first') : step.detail };
    });
    const allDone = steps.every((step) => step.state === 'done');
    const state: LessonProgress['state'] = !lessonOpen ? 'locked' : allDone ? 'done' : 'current';
    result.push({
      lessonId: lesson.lessonId, lessonTitle: lesson.lessonTitle, moduleId: lesson.moduleId, moduleTitle: lesson.moduleTitle,
      state, steps,
      hint: state === 'locked' ? 'Finish the previous lesson first. Every part of a lesson must be done before the next one opens.' : '',
      dueAt: '', allocationHours: 0, rescheduled: 0,
      pendingExtension: requests.some((r) => r.studentId === studentId && r.courseId === courseId && r.status === 'pending' && r.kind === 'extension'),
    });
    previousDone = state === 'done';
  });

  /* ── timeline: the per-student time window of the lesson in progress ── */
  const total = result.length;
  const completed = result.filter((item) => item.state === 'done').length;
  let courseTimeline: CourseTimeline = { configured: false, status: 'none', minimumHours: 0, allocationHours: 0, remainingDays: 0, projectedCompletion: '', endingAt: '', enrolledAt: '', warning: '' };
  if (timeline && total > 0) {
    const [enrolledAt, override] = await Promise.all([enrollmentDate(studentId, courseId), endingOverride(studentId, courseId)]);
    const dates = { ...timeline.dates, courseEnding: Math.max(timeline.dates.courseEnding, override) };
    const state = timelineState(timeline.dates, now, total, completed, override);
    const mineWin: Record<string, Window> = { ...(windowsAll[studentId]?.[courseId] || {}) };
    let changed = false;
    let cursor = enrolledAt; // when the next lesson's clock starts
    for (let i = 0; i < total; i += 1) {
      const lesson = result[i];
      let win = mineWin[lesson.lessonId];
      if (lesson.state === 'done') {
        if (options.sync && (!win || !win.completedAt)) {
          win = { ...win, startedAt: win?.startedAt || new Date(cursor).toISOString(), allocMs: win?.allocMs || 0, completedAt: nowIso };
          mineWin[lesson.lessonId] = win; changed = true;
        }
        cursor = Date.parse(win?.completedAt || '') || cursor;
        continue;
      }
      if (lesson.state === 'current' && state.status !== 'expired' && state.status !== 'completed') {
        // The window is created when the lesson opens and stays fixed while the student works;
        // only when it runs out is the time re-calculated from what is left.
        if (!win && options.sync) {
          const allocMs = i === 0 ? initialAllocation(dates, enrolledAt, total) : dynamicAllocation(dates, cursor, total, completed);
          win = { startedAt: new Date(cursor).toISOString(), allocMs };
          mineWin[lesson.lessonId] = win; changed = true;
        }
        if (win && options.sync && now > Date.parse(win.startedAt) + win.allocMs) {
          win = { startedAt: nowIso, allocMs: dynamicAllocation(dates, now, total, completed), reschedules: (win.reschedules || 0) + 1 };
          mineWin[lesson.lessonId] = win; changed = true;
        }
        if (win) {
          lesson.dueAt = new Date(Date.parse(win.startedAt) + win.allocMs).toISOString();
          lesson.allocationHours = Math.round((win.allocMs / HOUR) * 10) / 10;
          lesson.rescheduled = win.reschedules || 0;
        }
      }
      break; // only the lesson in progress has a window
    }
    if (changed) await kvSet(WINDOWS_KEY, { ...windowsAll, [studentId]: { ...windowsAll[studentId], [courseId]: mineWin } });
    courseTimeline = {
      configured: true, status: state.status,
      minimumHours: Math.round((minimumLessonTime(timeline.dates, total) / HOUR) * 10) / 10,
      allocationHours: Math.round((state.allocation / HOUR) * 10) / 10,
      remainingDays: Math.round((state.remainingTime / (24 * HOUR)) * 10) / 10,
      projectedCompletion: new Date(state.projectedCompletion).toISOString(),
      endingAt: new Date(dates.courseEnding).toISOString(), enrolledAt: new Date(enrolledAt).toISOString(),
      warning: state.warning,
    };
  }

  // Course Final Exam: an exam that belongs to no module or lesson. It opens when every lesson is done
  // and must be passed before the course counts as complete.
  const finals = exams.filter((e) => e.published && e.courseId === courseId && !e.lessonId && !e.moduleId);
  const finalsPassed = finals.filter((e) => examAttempts.some((a) => a.examId === e.id && a.status === 'submitted' && a.passed)).length;
  const finalExam = { total: finals.length, passed: finalsPassed, open: total > 0 && completed === total };

  const current = result.find((lesson) => lesson.steps.some((step) => step.state === 'current')) || result.find((lesson) => lesson.state === 'current');
  return {
    courseTitle: title,
    lessons: result,
    finalExam,
    percent: total ? Math.round(((completed + finalsPassed) / (total + finals.length)) * 100) : 0,
    currentLessonId: current?.lessonId || result[result.length - 1]?.lessonId || '',
    timeline: courseTimeline,
  };
}

/** Is the given part of a lesson open for this student? Used to lock the APIs. */
export async function stepOpen(studentId: string, courseId: string, lessonId: string, key: StepKey) {
  const { lessons } = await courseProgress(studentId, courseId);
  const lesson = lessons.find((item) => item.lessonId === lessonId);
  if (!lesson || lesson.state === 'locked') return false;
  const step = lesson.steps.find((item) => item.key === key);
  return step ? step.state !== 'locked' : true;
}

/** Is the Course Final Exam open? Only once every lesson of the course is done. */
export async function finalExamOpen(studentId: string, courseId: string) {
  return (await courseProgress(studentId, courseId)).finalExam.open;
}

export async function lessonOpen(studentId: string, courseId: string, lessonId: string) {
  const { lessons } = await courseProgress(studentId, courseId);
  const lesson = lessons.find((item) => item.lessonId === lessonId);
  return Boolean(lesson && lesson.state !== 'locked');
}
