import { kvGet, kvSet } from '@/lib/kv-store';

// Lesson quizzes: every quiz belongs to one course → module → lesson.
export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonQuiz = {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  title: string;
  passMark: number; // percent needed to pass
  maxAttempts: number; // 0 = unlimited
  published: boolean;
  questions: QuizQuestion[];
  /** Given automatically: QZ-00001, QZ-00002, … */
  number?: string;
  /** Marks for one correct answer (older quizzes: 1). */
  marksPerQuestion?: number;
  /** Marks taken away for one wrong answer; unanswered questions cost nothing. */
  negativeMarks?: number;
  /** Show the right answers and explanations after submitting (older quizzes: yes). */
  showAnswers?: boolean;
  /** Minutes for one attempt; 0 = no time limit. */
  timeLimitMinutes?: number;
  /** Students cannot take it before this time ('' = as soon as it is published). */
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  courseId: string;
  lessonId: string;
  studentId: string;
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  /** Marks earned out of maxScore (negative marking included). */
  score?: number;
  maxScore?: number;
  at: string;
};

const QUIZZES_KEY = 'lesson-quizzes';
const ATTEMPTS_KEY = 'quiz-attempts';
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const numberOf = (quiz: LessonQuiz) => Number((quiz.number || '').replace(/\D/g, '')) || 0;
const asNumber = (value: number) => `QZ-${String(value).padStart(5, '0')}`;

export async function listQuizzes(): Promise<LessonQuiz[]> {
  const list = await kvGet<LessonQuiz[]>(QUIZZES_KEY, []);
  if (!Array.isArray(list)) return [];
  // Quizzes made before numbering get the next numbers, oldest first; they are kept on the next save.
  let last = list.reduce((max, quiz) => Math.max(max, numberOf(quiz)), 0);
  const added = new Map([...list].filter((quiz) => !quiz.number)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .map((quiz) => [quiz.id, asNumber(++last)]));
  return list.map((quiz) => (quiz.number ? quiz : { ...quiz, number: added.get(quiz.id) }));
}

const within = (value: unknown, min: number, max: number, fallback: number) => {
  const found = Number(value ?? fallback);
  return Number.isFinite(found) ? Math.min(max, Math.max(min, found)) : fallback;
};

export async function quizzesForLesson(courseId: string, lessonId: string) {
  return (await listQuizzes()).filter((quiz) => quiz.published && quiz.courseId === courseId && quiz.lessonId === lessonId);
}

export async function quizzesForCourses(courseIds: string[]) {
  const wanted = new Set(courseIds);
  return (await listQuizzes()).filter((quiz) => quiz.published && wanted.has(quiz.courseId));
}

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

export async function saveQuiz(input: Partial<LessonQuiz>): Promise<LessonQuiz> {
  const title = clean(input.title, 140);
  if (!input.courseId || !input.moduleId || !input.lessonId) throw new Error('Choose the course, module and lesson for this quiz.');
  if (!title) throw new Error('Give the quiz a title.');
  const questions = (Array.isArray(input.questions) ? input.questions : []).map((question) => {
    const choices = (Array.isArray(question.choices) ? question.choices : []).map((choice) => clean(choice, 300)).filter(Boolean).slice(0, 6);
    return {
      id: question.id || uid('q'),
      prompt: clean(question.prompt, 600),
      choices,
      correctIndex: Math.min(Math.max(0, Number(question.correctIndex) || 0), Math.max(0, choices.length - 1)),
      explanation: clean(question.explanation, 600),
    };
  }).filter((question) => question.prompt && question.choices.length >= 2);
  if (questions.length === 0) throw new Error('Add at least one question with two or more answer choices.');

  const list = await listQuizzes();
  const existing = input.id ? list.find((quiz) => quiz.id === input.id) : undefined;
  const now = new Date().toISOString();
  const quiz: LessonQuiz = {
    id: existing?.id || uid('quiz'),
    courseId: String(input.courseId),
    courseTitle: clean(input.courseTitle, 200),
    moduleId: String(input.moduleId),
    moduleTitle: clean(input.moduleTitle, 200),
    lessonId: String(input.lessonId),
    lessonTitle: clean(input.lessonTitle, 200),
    title,
    passMark: Math.min(100, Math.max(0, Math.round(Number(input.passMark ?? 70)))),
    maxAttempts: Math.min(50, Math.max(0, Math.round(Number(input.maxAttempts ?? 0)))),
    published: Boolean(input.published),
    questions,
    number: existing?.number || asNumber(list.reduce((max, item) => Math.max(max, numberOf(item)), 0) + 1),
    marksPerQuestion: within(input.marksPerQuestion, 0.25, 100, 1),
    negativeMarks: within(input.negativeMarks, 0, 100, 0),
    showAnswers: input.showAnswers !== false,
    timeLimitMinutes: Math.round(within(input.timeLimitMinutes, 0, 600, 0)),
    availableFrom: Number.isFinite(Date.parse(String(input.availableFrom || ''))) ? new Date(String(input.availableFrom)).toISOString() : '',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await kvSet(QUIZZES_KEY, existing ? list.map((item) => (item.id === quiz.id ? quiz : item)) : [quiz, ...list]);
  return quiz;
}

export async function deleteQuiz(id: string) {
  await kvSet(QUIZZES_KEY, (await listQuizzes()).filter((quiz) => quiz.id !== id));
}

export const notYetAvailable = (quiz: LessonQuiz, now = Date.now()) => Boolean(quiz.availableFrom) && Date.parse(quiz.availableFrom!) > now;

export const questionsForStudent = (quiz: LessonQuiz) => quiz.questions.map((question) => ({ id: question.id, prompt: question.prompt, choices: question.choices }));

/**
 * Questions without the answers, for students taking the quiz. A timed quiz sends its questions
 * only while an attempt is running (`running`), and no quiz sends them before its opening time.
 */
export function studentView(quiz: LessonQuiz, running = false) {
  const hidden = notYetAvailable(quiz) || (Boolean(quiz.timeLimitMinutes) && !running);
  return {
    id: quiz.id,
    number: quiz.number || '',
    title: quiz.title,
    passMark: quiz.passMark,
    lessonId: quiz.lessonId,
    marksPerQuestion: quiz.marksPerQuestion || 1,
    negativeMarks: quiz.negativeMarks || 0,
    timeLimitMinutes: quiz.timeLimitMinutes || 0,
    availableFrom: notYetAvailable(quiz) ? quiz.availableFrom! : '',
    questionCount: quiz.questions.length,
    questions: hidden ? [] : questionsForStudent(quiz),
  };
}

/* ── timed attempts: the server keeps the start time ── */
const STARTS_KEY = 'quiz-starts'; // "studentId:quizId" → ISO start of the running attempt
/** Allowance for the time the answers take to arrive. */
export const SUBMIT_GRACE_MS = 30000;

const startKey = (studentId: string, quizId: string) => `${studentId}:${quizId}`;
const readStarts = async () => (await kvGet<Record<string, string>>(STARTS_KEY, {})) || {};

export async function startedAt(studentId: string, quizId: string) {
  return Date.parse((await readStarts())[startKey(studentId, quizId)] || '') || 0;
}

export async function setStart(studentId: string, quizId: string, at: number | null) {
  const all = await readStarts();
  if (at === null) delete all[startKey(studentId, quizId)];
  else all[startKey(studentId, quizId)] = new Date(at).toISOString();
  await kvSet(STARTS_KEY, all);
}

export const endsAt = (quiz: LessonQuiz, start: number) => start + (quiz.timeLimitMinutes || 0) * 60000;

/** An attempt whose time ran out without answers arriving still counts as one attempt. */
export async function closeExpiredStart(quiz: LessonQuiz, studentId: string) {
  const start = await startedAt(studentId, quiz.id);
  if (!start || !quiz.timeLimitMinutes || Date.now() <= endsAt(quiz, start) + SUBMIT_GRACE_MS) return;
  await gradeQuiz(quiz, studentId, {});
  await setStart(studentId, quiz.id, null);
}

export async function listAttempts(studentId?: string): Promise<QuizAttempt[]> {
  const list = await kvGet<QuizAttempt[]>(ATTEMPTS_KEY, []);
  const all = Array.isArray(list) ? list : [];
  return studentId ? all.filter((attempt) => attempt.studentId === studentId) : all;
}

/** Marks a submission on the server and records the attempt. */
export async function gradeQuiz(quiz: LessonQuiz, studentId: string, answers: Record<string, number>) {
  const results = quiz.questions.map((question) => {
    const chosen = Number.isInteger(answers[question.id]) ? answers[question.id] : -1;
    return { id: question.id, chosen, correctIndex: question.correctIndex, correct: chosen === question.correctIndex, explanation: question.explanation };
  });
  const correct = results.filter((result) => result.correct).length;
  const wrong = results.filter((result) => !result.correct && result.chosen >= 0).length;
  const total = quiz.questions.length;
  const marks = quiz.marksPerQuestion || 1;
  const maxScore = total * marks;
  const score = Math.max(0, Math.round((correct * marks - wrong * (quiz.negativeMarks || 0)) * 100) / 100);
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const attempt: QuizAttempt = {
    id: uid('attempt'), quizId: quiz.id, courseId: quiz.courseId, lessonId: quiz.lessonId, studentId,
    correct, total, percent, passed: percent >= quiz.passMark, score, maxScore, at: new Date().toISOString(),
  };
  await kvSet(ATTEMPTS_KEY, [attempt, ...(await listAttempts())].slice(0, 5000));
  return { attempt, results };
}
