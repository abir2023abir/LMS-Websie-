import { kvGet, kvSet } from '@/lib/kv-store';

// Lesson assignments: each belongs to a course → module → lesson. Students answer
// with text and/or a file; mentors and admins review, score and give feedback.
export type LessonAssignment = {
  id: string;
  courseId: string; courseTitle: string;
  moduleId: string; moduleTitle: string;
  lessonId: string; lessonTitle: string;
  title: string;
  instructions: string;
  dueDate: string; // YYYY-MM-DD or ''
  maxScore: number;
  allowFile: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionStatus = 'submitted' | 'needs-changes' | 'graded';

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  courseId: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  text: string;
  fileId: string;
  fileName: string;
  late: boolean;
  status: SubmissionStatus;
  score: number | null;
  feedback: string;
  submittedAt: string;
  reviewedAt: string;
};

const ASSIGNMENTS_KEY = 'lesson-assignments';
const SUBMISSIONS_KEY = 'assignment-submissions';
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

export async function listAssignments(): Promise<LessonAssignment[]> {
  const list = await kvGet<LessonAssignment[]>(ASSIGNMENTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function saveAssignment(input: Partial<LessonAssignment>): Promise<LessonAssignment> {
  if (!input.courseId || !input.moduleId || !input.lessonId) throw new Error('Choose the course, module and lesson for this assignment.');
  const title = clean(input.title, 160);
  const instructions = clean(input.instructions, 6000);
  if (!title) throw new Error('Give the assignment a title.');
  if (!instructions) throw new Error('Write the instructions for students.');
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(input.dueDate || '')) ? String(input.dueDate) : '';
  const list = await listAssignments();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const now = new Date().toISOString();
  const assignment: LessonAssignment = {
    id: existing?.id || uid('asg'),
    courseId: String(input.courseId), courseTitle: clean(input.courseTitle, 200),
    moduleId: String(input.moduleId), moduleTitle: clean(input.moduleTitle, 200),
    lessonId: String(input.lessonId), lessonTitle: clean(input.lessonTitle, 200),
    title, instructions, dueDate,
    maxScore: Math.min(1000, Math.max(1, Math.round(Number(input.maxScore) || 100))),
    allowFile: input.allowFile !== false,
    published: Boolean(input.published),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await kvSet(ASSIGNMENTS_KEY, existing ? list.map((item) => (item.id === assignment.id ? assignment : item)) : [assignment, ...list]);
  return assignment;
}

export async function deleteAssignment(id: string) {
  await kvSet(ASSIGNMENTS_KEY, (await listAssignments()).filter((item) => item.id !== id));
}

export async function listSubmissions(): Promise<AssignmentSubmission[]> {
  const list = await kvGet<AssignmentSubmission[]>(SUBMISSIONS_KEY, []);
  return Array.isArray(list) ? list : [];
}

/* Files are kept as data URLs under their own key (Vercel accepts uploads up to ~4 MB). */
const MAX_FILE = 4 * 1024 * 1024;
const FILE_TYPES = new Set([
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'application/zip', 'application/x-zip-compressed',
]);

export async function saveSubmissionFile(file: File) {
  if (file.size > MAX_FILE) throw new Error('The file must be 4 MB or smaller.');
  if (file.type && !FILE_TYPES.has(file.type)) throw new Error('Upload a PDF, Word, Excel, PowerPoint, image, text or ZIP file.');
  const id = uid('file');
  await kvSet(`assignment-file-${id}`, { name: file.name, type: file.type || 'application/octet-stream', data: Buffer.from(await file.arrayBuffer()).toString('base64') });
  return id;
}

export async function readSubmissionFile(id: string) {
  const stored = await kvGet<{ name: string; type: string; data: string } | null>(`assignment-file-${id.replace(/[^a-z0-9-]/gi, '')}`, null);
  return stored ? { name: stored.name, type: stored.type, bytes: Buffer.from(stored.data, 'base64') } : null;
}

export async function submitAssignment(assignment: LessonAssignment, student: { id: string; name: string; email: string }, input: { text: string; fileId?: string; fileName?: string }) {
  const text = clean(input.text, 10000);
  if (!text && !input.fileId) throw new Error('Write your answer or attach a file.');
  const list = await listSubmissions();
  const existing = list.find((item) => item.assignmentId === assignment.id && item.studentId === student.id);
  if (existing?.status === 'graded') throw new Error('This assignment has already been graded.');
  const now = new Date().toISOString();
  const late = Boolean(assignment.dueDate) && now.slice(0, 10) > assignment.dueDate;
  const submission: AssignmentSubmission = {
    id: existing?.id || uid('sub'),
    assignmentId: assignment.id, courseId: assignment.courseId, lessonId: assignment.lessonId,
    studentId: student.id, studentName: student.name, studentEmail: student.email,
    text, fileId: input.fileId || existing?.fileId || '', fileName: input.fileName || existing?.fileName || '',
    late, status: 'submitted', score: null, feedback: existing?.feedback || '',
    submittedAt: now, reviewedAt: existing?.reviewedAt || '',
  };
  await kvSet(SUBMISSIONS_KEY, existing ? list.map((item) => (item.id === submission.id ? submission : item)) : [submission, ...list]);
  return submission;
}

export async function reviewSubmission(id: string, input: { status: SubmissionStatus; score: number | null; feedback: string }, maxScore: number) {
  const list = await listSubmissions();
  const current = list.find((item) => item.id === id);
  if (!current) throw new Error('Submission not found.');
  const score = input.status === 'graded' && input.score !== null ? Math.min(maxScore, Math.max(0, Math.round(Number(input.score)))) : null;
  if (input.status === 'graded' && score === null) throw new Error('Enter a score to grade this submission.');
  const next: AssignmentSubmission = { ...current, status: input.status, score, feedback: clean(input.feedback, 4000), reviewedAt: new Date().toISOString() };
  await kvSet(SUBMISSIONS_KEY, list.map((item) => (item.id === id ? next : item)));
  return next;
}
