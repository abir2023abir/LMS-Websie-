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
  published: boolean;
  questions: QuizQuestion[];
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
  at: string;
};

const QUIZZES_KEY = 'lesson-quizzes';
const ATTEMPTS_KEY = 'quiz-attempts';
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function listQuizzes(): Promise<LessonQuiz[]> {
  const list = await kvGet<LessonQuiz[]>(QUIZZES_KEY, []);
  return Array.isArray(list) ? list : [];
}

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
    published: Boolean(input.published),
    questions,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await kvSet(QUIZZES_KEY, existing ? list.map((item) => (item.id === quiz.id ? quiz : item)) : [quiz, ...list]);
  return quiz;
}

export async function deleteQuiz(id: string) {
  await kvSet(QUIZZES_KEY, (await listQuizzes()).filter((quiz) => quiz.id !== id));
}

/** Questions without the answers, for students taking the quiz. */
export function studentView(quiz: LessonQuiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    passMark: quiz.passMark,
    lessonId: quiz.lessonId,
    questions: quiz.questions.map((question) => ({ id: question.id, prompt: question.prompt, choices: question.choices })),
  };
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
  const total = quiz.questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const attempt: QuizAttempt = {
    id: uid('attempt'), quizId: quiz.id, courseId: quiz.courseId, lessonId: quiz.lessonId, studentId,
    correct, total, percent, passed: percent >= quiz.passMark, at: new Date().toISOString(),
  };
  await kvSet(ATTEMPTS_KEY, [attempt, ...(await listAttempts())].slice(0, 5000));
  return { attempt, results };
}
