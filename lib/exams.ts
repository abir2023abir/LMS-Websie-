import { kvGet, kvSet } from '@/lib/kv-store';

// Timed exams for a whole course, one module, or one lesson. Questions are marked on
// the server; the time limit is enforced on the server too.
export type ExamQuestion = { id: string; prompt: string; choices: string[]; correctIndex: number; points: number; explanation: string };

export type Exam = {
  id: string;
  courseId: string; courseTitle: string;
  moduleId: string; moduleTitle: string; // '' = whole course
  lessonId: string; lessonTitle: string; // '' = whole module / course
  title: string;
  description: string;
  durationMinutes: number;
  opensAt: string;  // ISO or ''
  closesAt: string; // ISO or ''
  passMark: number;
  maxAttempts: number; // 0 = unlimited
  shuffle: boolean;
  showAnswers: boolean;
  published: boolean;
  questions: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type ExamAttempt = {
  id: string;
  examId: string;
  courseId: string;
  studentId: string; studentName: string; studentEmail: string;
  questionOrder: string[];
  startedAt: string;
  deadline: string;
  submittedAt: string;
  answers: Record<string, number>;
  score: number; total: number; percent: number; passed: boolean;
  status: 'in-progress' | 'submitted';
};

const EXAMS_KEY = 'exams';
const ATTEMPTS_KEY = 'exam-attempts';
const GRACE_MS = 60 * 1000;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const isoOrEmpty = (value: unknown) => {
  const date = new Date(String(value || ''));
  return value && !Number.isNaN(date.getTime()) ? date.toISOString() : '';
};

export async function listExams(): Promise<Exam[]> {
  const list = await kvGet<Exam[]>(EXAMS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function saveExam(input: Partial<Exam>): Promise<Exam> {
  if (!input.courseId) throw new Error('Choose the course for this exam.');
  const title = clean(input.title, 160);
  if (!title) throw new Error('Give the exam a title.');
  const questions = (Array.isArray(input.questions) ? input.questions : []).map((question) => {
    const choices = (Array.isArray(question.choices) ? question.choices : []).map((choice) => clean(choice, 300)).filter(Boolean).slice(0, 6);
    return {
      id: question.id || uid('eq'),
      prompt: clean(question.prompt, 800),
      choices,
      correctIndex: Math.min(Math.max(0, Number(question.correctIndex) || 0), Math.max(0, choices.length - 1)),
      points: Math.min(100, Math.max(1, Math.round(Number(question.points) || 1))),
      explanation: clean(question.explanation, 600),
    };
  }).filter((question) => question.prompt && question.choices.length >= 2);
  if (questions.length === 0) throw new Error('Add at least one question with two or more answer choices.');
  const opensAt = isoOrEmpty(input.opensAt);
  const closesAt = isoOrEmpty(input.closesAt);
  if (opensAt && closesAt && closesAt <= opensAt) throw new Error('The closing time must be after the opening time.');

  const list = await listExams();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const now = new Date().toISOString();
  const exam: Exam = {
    id: existing?.id || uid('exam'),
    courseId: String(input.courseId), courseTitle: clean(input.courseTitle, 200),
    moduleId: String(input.moduleId || ''), moduleTitle: input.moduleId ? clean(input.moduleTitle, 200) : '',
    lessonId: input.moduleId ? String(input.lessonId || '') : '', lessonTitle: input.moduleId && input.lessonId ? clean(input.lessonTitle, 200) : '',
    title,
    description: clean(input.description, 3000),
    durationMinutes: Math.min(600, Math.max(1, Math.round(Number(input.durationMinutes) || 30))),
    opensAt, closesAt,
    passMark: Math.min(100, Math.max(0, Math.round(Number(input.passMark ?? 60)))),
    maxAttempts: Math.min(20, Math.max(0, Math.round(Number(input.maxAttempts ?? 1)))),
    shuffle: input.shuffle !== false,
    showAnswers: Boolean(input.showAnswers),
    published: Boolean(input.published),
    questions,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await kvSet(EXAMS_KEY, existing ? list.map((item) => (item.id === exam.id ? exam : item)) : [exam, ...list]);
  return exam;
}

export async function deleteExam(id: string) {
  await kvSet(EXAMS_KEY, (await listExams()).filter((item) => item.id !== id));
}

export async function listExamAttempts(): Promise<ExamAttempt[]> {
  const list = await kvGet<ExamAttempt[]>(ATTEMPTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

async function writeAttempts(list: ExamAttempt[]) {
  await kvSet(ATTEMPTS_KEY, list.slice(0, 10000));
}

export function examWindow(exam: Exam, now = new Date()) {
  if (exam.opensAt && now < new Date(exam.opensAt)) return 'upcoming' as const;
  if (exam.closesAt && now > new Date(exam.closesAt)) return 'closed' as const;
  return 'open' as const;
}

const totalPoints = (exam: Exam) => exam.questions.reduce((sum, question) => sum + question.points, 0);

function grade(exam: Exam, attempt: ExamAttempt, answers: Record<string, number>): ExamAttempt {
  const score = exam.questions.reduce((sum, question) => sum + (answers[question.id] === question.correctIndex ? question.points : 0), 0);
  const total = totalPoints(exam);
  const percent = total ? Math.round((score / total) * 100) : 0;
  return { ...attempt, answers, score, total, percent, passed: percent >= exam.passMark, status: 'submitted', submittedAt: new Date().toISOString() };
}

/** Submits any attempt whose time ran out (with what was answered so far: nothing). */
async function closeExpired(list: ExamAttempt[], exams: Exam[]) {
  let changed = false;
  const now = Date.now();
  const next = list.map((attempt) => {
    if (attempt.status !== 'in-progress' || new Date(attempt.deadline).getTime() + GRACE_MS > now) return attempt;
    const exam = exams.find((item) => item.id === attempt.examId);
    changed = true;
    return exam ? grade(exam, attempt, attempt.answers || {}) : { ...attempt, status: 'submitted' as const, submittedAt: new Date().toISOString() };
  });
  if (changed) await writeAttempts(next);
  return next;
}

export async function attemptsFor(studentId?: string) {
  const [exams, raw] = await Promise.all([listExams(), listExamAttempts()]);
  const list = await closeExpired(raw, exams);
  return studentId ? list.filter((attempt) => attempt.studentId === studentId) : list;
}

/** Starts (or resumes) an attempt and returns the questions without answers. */
export async function startAttempt(exam: Exam, student: { id: string; name: string; email: string }) {
  if (examWindow(exam) !== 'open') throw new Error('This exam is not open right now.');
  const mine = await attemptsFor(student.id);
  const ongoing = mine.find((attempt) => attempt.examId === exam.id && attempt.status === 'in-progress');
  let attempt = ongoing;
  if (!attempt) {
    const used = mine.filter((item) => item.examId === exam.id).length;
    if (exam.maxAttempts && used >= exam.maxAttempts) throw new Error('You have used all your attempts for this exam.');
    const order = exam.questions.map((question) => question.id);
    if (exam.shuffle) order.sort(() => Math.random() - 0.5);
    const started = new Date();
    let deadline = new Date(started.getTime() + exam.durationMinutes * 60 * 1000);
    if (exam.closesAt && deadline > new Date(exam.closesAt)) deadline = new Date(exam.closesAt);
    attempt = {
      id: uid('attempt'), examId: exam.id, courseId: exam.courseId,
      studentId: student.id, studentName: student.name, studentEmail: student.email,
      questionOrder: order, startedAt: started.toISOString(), deadline: deadline.toISOString(), submittedAt: '',
      answers: {}, score: 0, total: totalPoints(exam), percent: 0, passed: false, status: 'in-progress',
    };
    await writeAttempts([attempt, ...(await listExamAttempts())]);
  }
  const byId = new Map(exam.questions.map((question) => [question.id, question]));
  return {
    attemptId: attempt.id,
    deadline: attempt.deadline,
    questions: attempt.questionOrder.map((id) => byId.get(id)).filter(Boolean).map((question) => ({ id: question!.id, prompt: question!.prompt, choices: question!.choices, points: question!.points })),
    answers: attempt.answers,
  };
}

/** Saves answers mid-exam so a refresh or lost connection does not lose work. */
export async function saveProgress(attemptId: string, studentId: string, answers: Record<string, number>) {
  const list = await listExamAttempts();
  const attempt = list.find((item) => item.id === attemptId && item.studentId === studentId);
  if (!attempt || attempt.status !== 'in-progress') return;
  if (Date.now() > new Date(attempt.deadline).getTime() + GRACE_MS) return;
  await writeAttempts(list.map((item) => (item.id === attemptId ? { ...item, answers } : item)));
}

export async function submitAttempt(exam: Exam, attemptId: string, studentId: string, answers: Record<string, number>) {
  const list = await listExamAttempts();
  const attempt = list.find((item) => item.id === attemptId && item.studentId === studentId && item.examId === exam.id);
  if (!attempt) throw new Error('Exam attempt not found.');
  if (attempt.status === 'submitted') return attempt;
  // After the deadline (plus a minute's grace) only the answers saved in time count.
  const late = Date.now() > new Date(attempt.deadline).getTime() + GRACE_MS;
  const graded = grade(exam, attempt, late ? attempt.answers || {} : answers);
  await writeAttempts(list.map((item) => (item.id === attemptId ? graded : item)));
  return graded;
}
