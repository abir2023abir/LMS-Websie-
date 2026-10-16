import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';

const file = dataPath('admin-lms.json');
const proofDir = dataPath('admin-payment-proofs');
const assignmentDir = dataPath('assignment-files');

export type QuizQuestion = { id: string; prompt: string; choices: string[]; correctIndex: number };
export type AdminQuiz = { id: string; title: string; questions: QuizQuestion[]; createdAt: string };
export type StudentStatus = 'Active' | 'Paused' | 'Completed';
export type AdminStudent = {
  id: string;
  name: string;
  email: string;
  program: string;
  status: StudentStatus;
  joinedDate: string;
};
export type AdminCertificate = { id: string; studentName: string; course: string; date: string; createdAt: string };
export type AdminAssignment = {
  id: string;
  title: string;
  course: string;
  instructions: string;
  dueDate: string;
  createdAt: string;
};
export type SubmissionStatus = 'submitted' | 'reviewed' | 'graded';
export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentName: string;
  email: string;
  text: string;
  fileName: string;
  storedFile: string;
  status: SubmissionStatus;
  grade: string;
  review: string;
  submittedAt: string;
};
export type EarningsRow = {
  id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: string;
  date: string;
};
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type LedgerPayment = {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string;
  screenshot: string;
  source: 'sslcommerz' | 'manual';
  createdAt: string;
};

type Db = {
  quizzes: AdminQuiz[];
  students: AdminStudent[];
  certificates: AdminCertificate[];
  assignments: AdminAssignment[];
  submissions: AssignmentSubmission[];
  earnings: EarningsRow[];
  payments: LedgerPayment[];
};

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function seed(): Db {
  const students: AdminStudent[] = [
    { id: 'std-1', name: 'Tanvir Ahmed', email: 'tanvir@gmail.com', program: 'Spoken English & Accent Perfection', status: 'Active', joinedDate: '2026-08-14' },
    { id: 'std-2', name: 'Nusaiba Rahaman', email: 'nusaiba@yahoo.com', program: 'IELTS Academic & General Band 8+', status: 'Active', joinedDate: '2026-08-15' },
    { id: 'std-3', name: 'Mahmudul Hasan', email: 'mahmud@gmail.com', program: 'Business English & Corporate Communication', status: 'Active', joinedDate: '2026-08-16' },
    { id: 'std-4', name: 'Sadia Sultana', email: 'sadia@gmail.com', program: 'Phonics Safari: Alphabet Magic', status: 'Active', joinedDate: '2026-08-17' },
    { id: 'std-5', name: 'Kamrul Islam', email: 'kamrul@gmail.com', program: 'General English Foundation Capsule', status: 'Active', joinedDate: '2026-08-18' },
  ];
  const sample = [
    { id: 'TXN-8921', studentName: 'Tanvir Ahmed', email: 'tanvir@gmail.com', courseTitle: 'Spoken English & Accent Perfection', amount: 5880, method: 'SSLCommerz (bKash)', date: 'Today, 2:15 PM' },
    { id: 'TXN-8920', studentName: 'Nusaiba Rahaman', email: 'nusaiba@yahoo.com', courseTitle: 'IELTS Academic Band 8+ Masterclass', amount: 8280, method: 'SSLCommerz (Visa)', date: 'Today, 11:40 AM' },
    { id: 'TXN-8919', studentName: 'Mahmudul Hasan', email: 'mahmud@gmail.com', courseTitle: 'Business English & Corporate Skills', amount: 7080, method: 'SSLCommerz (Nagad)', date: 'Yesterday, 8:20 PM' },
    { id: 'TXN-8918', studentName: 'Sadia Sultana', email: 'sadia@gmail.com', courseTitle: 'Phonics Safari: Alphabet Magic', amount: 3480, method: 'SSLCommerz (bKash)', date: 'Aug 17, 2026' },
  ];
  return {
    quizzes: [],
    students,
    certificates: [],
    assignments: [],
    submissions: [],
    earnings: sample.map((row) => ({
      id: row.id,
      studentName: row.studentName,
      courseTitle: row.courseTitle,
      amount: row.amount,
      method: row.method,
      status: 'Paid',
      date: row.date,
    })),
    payments: sample.map((row) => ({
      id: row.id,
      studentName: row.studentName,
      studentEmail: row.email,
      courseTitle: row.courseTitle,
      amount: row.amount,
      method: row.method,
      status: 'paid' as const,
      transactionId: row.id,
      screenshot: '',
      source: 'sslcommerz' as const,
      createdAt: row.date,
    })),
  };
}

function load(): Db {
  const base = seed();
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<Db>;
    return {
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      students: Array.isArray(parsed.students) ? parsed.students : base.students,
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      earnings: Array.isArray(parsed.earnings) ? parsed.earnings : base.earnings,
      payments: Array.isArray(parsed.payments) ? parsed.payments : base.payments,
    };
  } catch {
    return base;
  }
}

function save(db: Db) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function cleanQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((question) => ({
      id: question.id || uid('q'),
      prompt: String(question.prompt || '').trim(),
      choices: (question.choices || []).map((choice) => String(choice || '').trim()).filter(Boolean).slice(0, 6),
      correctIndex: Number(question.correctIndex) || 0,
    }))
    .filter((question) => question.prompt && question.choices.length >= 2)
    .map((question) => ({
      ...question,
      correctIndex: Math.min(Math.max(0, question.correctIndex), question.choices.length - 1),
    }));
}

export function listQuizzes() {
  return load().quizzes;
}

export function saveQuiz(input: { id?: string; title: string; questions: QuizQuestion[] }) {
  const db = load();
  const questions = cleanQuestions(input.questions);
  if (!input.title.trim() || questions.length === 0) throw new Error('A quiz needs a title and at least one question with two choices.');
  const existing = db.quizzes.find((item) => item.id === input.id);
  const record: AdminQuiz = {
    id: existing?.id || uid('quiz'),
    title: input.title.trim(),
    questions,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  db.quizzes = existing ? db.quizzes.map((item) => (item.id === record.id ? record : item)) : [record, ...db.quizzes];
  save(db);
  return record;
}

export function deleteQuiz(id: string) {
  const db = load();
  db.quizzes = db.quizzes.filter((item) => item.id !== id);
  save(db);
}

export function listStudents() {
  return load().students;
}

export function saveStudent(input: { id?: string; name: string; email: string; program: string; status: StudentStatus }) {
  const name = input.name.trim();
  const email = input.email.trim();
  const program = input.program.trim();
  if (!name || !email || !program) throw new Error('Name, email, and program are required.');
  const status: StudentStatus = input.status === 'Paused' || input.status === 'Completed' ? input.status : 'Active';
  const db = load();
  const existing = db.students.find((item) => item.id === input.id);
  const record: AdminStudent = {
    id: existing?.id || uid('std'),
    name,
    email,
    program,
    status,
    joinedDate: existing?.joinedDate || new Date().toISOString().slice(0, 10),
  };
  db.students = existing ? db.students.map((item) => (item.id === record.id ? record : item)) : [record, ...db.students];
  save(db);
  return record;
}

export function deleteStudent(id: string) {
  const db = load();
  db.students = db.students.filter((item) => item.id !== id);
  save(db);
}

export function listCertificates() {
  return load().certificates;
}

export function getCertificate(id: string) {
  return load().certificates.find((item) => item.id === id) || null;
}

export function saveCertificate(input: { id?: string; studentName: string; course: string; date: string }) {
  const studentName = input.studentName.trim();
  const course = input.course.trim();
  const date = input.date.trim();
  if (!studentName || !course || !date) throw new Error('Student name, course, and date are required.');
  const db = load();
  const existing = db.certificates.find((item) => item.id === input.id);
  const record: AdminCertificate = {
    id: existing?.id || uid('cert'),
    studentName,
    course,
    date,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  db.certificates = existing ? db.certificates.map((item) => (item.id === record.id ? record : item)) : [record, ...db.certificates];
  save(db);
  return record;
}

export function deleteCertificate(id: string) {
  const db = load();
  db.certificates = db.certificates.filter((item) => item.id !== id);
  save(db);
}

export function listAssignments() {
  return load().assignments;
}

export function saveAssignment(input: { id?: string; title: string; course: string; instructions: string; dueDate: string }) {
  const title = input.title.trim();
  const course = input.course.trim();
  const instructions = input.instructions.trim();
  if (!title || !course || !instructions) throw new Error('Title, course, and instructions are required.');
  const db = load();
  const existing = db.assignments.find((item) => item.id === input.id);
  const record: AdminAssignment = {
    id: existing?.id || uid('asg'),
    title,
    course,
    instructions,
    dueDate: input.dueDate.trim(),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  db.assignments = existing ? db.assignments.map((item) => (item.id === record.id ? record : item)) : [record, ...db.assignments];
  save(db);
  return record;
}

export function deleteAssignment(id: string) {
  const db = load();
  db.assignments = db.assignments.filter((item) => item.id !== id);
  db.submissions = db.submissions.filter((item) => item.assignmentId !== id);
  save(db);
}

export function listSubmissions() {
  return load().submissions;
}

export function submissionsForEmail(email: string) {
  const needle = email.trim().toLowerCase();
  return load().submissions.filter((item) => item.email.toLowerCase() === needle);
}

const allowedAssignmentExt = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf', '.txt', '.doc', '.docx']);

export function saveSubmission(input: {
  assignmentId: string;
  studentName: string;
  email: string;
  text: string;
  fileName?: string;
  bytes?: Buffer;
}) {
  const db = load();
  const task = db.assignments.find((item) => item.id === input.assignmentId);
  if (!task) throw new Error('That assignment is not open.');
  const studentName = input.studentName.trim();
  const email = input.email.trim();
  const text = input.text.trim();
  if (!studentName || !email) throw new Error('Name and email are required.');
  if (!text && !input.bytes?.length) throw new Error('Write an answer or attach a file.');
  const id = uid('sub');
  let storedFile = '';
  let fileName = '';
  if (input.bytes?.length && input.fileName) {
    const ext = path.extname(input.fileName).toLowerCase();
    if (!allowedAssignmentExt.has(ext)) throw new Error('Attach a pdf, image, or text file.');
    if (input.bytes.length > 4 * 1024 * 1024) throw new Error('File must be 4 MB or smaller.');
    fs.mkdirSync(assignmentDir, { recursive: true });
    storedFile = `${id}${ext}`;
    fileName = path.basename(input.fileName);
    fs.writeFileSync(path.join(assignmentDir, storedFile), input.bytes);
  }
  const record: AssignmentSubmission = {
    id,
    assignmentId: task.id,
    studentName,
    email,
    text,
    fileName,
    storedFile,
    status: 'submitted',
    grade: '',
    review: '',
    submittedAt: new Date().toISOString(),
  };
  db.submissions = [record, ...db.submissions];
  save(db);
  return record;
}

export function reviewSubmission(id: string, input: { status: SubmissionStatus; grade: string; review: string }) {
  const db = load();
  const status: SubmissionStatus = input.status === 'graded' || input.status === 'reviewed' ? input.status : 'submitted';
  let updated: AssignmentSubmission | null = null;
  db.submissions = db.submissions.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, status, grade: input.grade.trim(), review: input.review.trim() };
    return updated;
  });
  if (!updated) throw new Error('Submission not found.');
  save(db);
  return updated;
}

export function assignmentFilePath(storedFile: string) {
  const safe = path.basename(storedFile);
  return path.join(assignmentDir, safe);
}

export function listEarnings() {
  return load().earnings;
}

export function saveEarning(input: { id?: string; studentName: string; courseTitle: string; amount: number; method: string; status: string; date: string }) {
  const studentName = input.studentName.trim();
  const courseTitle = input.courseTitle.trim();
  if (!studentName || !courseTitle) throw new Error('Student and course are required.');
  const db = load();
  const existing = db.earnings.find((item) => item.id === input.id);
  const record: EarningsRow = {
    id: existing?.id || uid('earn'),
    studentName,
    courseTitle,
    amount: Number(input.amount) || 0,
    method: input.method.trim() || 'SSLCommerz',
    status: input.status.trim() || 'Paid',
    date: input.date.trim() || new Date().toLocaleString(),
  };
  db.earnings = existing ? db.earnings.map((item) => (item.id === record.id ? record : item)) : [record, ...db.earnings];
  save(db);
  return record;
}

export function deleteEarning(id: string) {
  const db = load();
  db.earnings = db.earnings.filter((item) => item.id !== id);
  save(db);
}

export function listPayments() {
  return load().payments;
}

const allowedProofExt = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export function savePayment(input: {
  id?: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  method: string;
  transactionId: string;
  status?: PaymentStatus;
  source?: 'sslcommerz' | 'manual';
  fileName?: string;
  bytes?: Buffer;
}) {
  const studentName = input.studentName.trim();
  const courseTitle = input.courseTitle.trim();
  if (!studentName || !courseTitle) throw new Error('Student and course are required.');
  const db = load();
  const existing = db.payments.find((item) => item.id === input.id);
  const id = existing?.id || uid('pay');
  let screenshot = existing?.screenshot || '';
  if (input.bytes?.length && input.fileName) {
    const ext = path.extname(input.fileName).toLowerCase();
    if (!allowedProofExt.has(ext)) throw new Error('Screenshot must be an image.');
    if (input.bytes.length > 4 * 1024 * 1024) throw new Error('Screenshot must be 4 MB or smaller.');
    fs.mkdirSync(proofDir, { recursive: true });
    screenshot = `${id}${ext}`;
    fs.writeFileSync(path.join(proofDir, screenshot), input.bytes);
  }
  const source = input.source || existing?.source || 'manual';
  const status: PaymentStatus = input.status || existing?.status || (source === 'sslcommerz' ? 'paid' : 'pending');
  const record: LedgerPayment = {
    id,
    studentName,
    studentEmail: input.studentEmail.trim(),
    courseTitle,
    amount: Number(input.amount) || 0,
    method: input.method.trim() || (source === 'sslcommerz' ? 'SSLCommerz' : 'Personal bKash'),
    status,
    transactionId: input.transactionId.trim() || existing?.transactionId || id,
    screenshot,
    source,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  db.payments = existing ? db.payments.map((item) => (item.id === record.id ? record : item)) : [record, ...db.payments];
  save(db);
  return record;
}

export function setPaymentStatus(id: string, status: PaymentStatus) {
  const db = load();
  let updated: LedgerPayment | null = null;
  db.payments = db.payments.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, status };
    return updated;
  });
  if (!updated) throw new Error('Payment not found.');
  save(db);
  return updated;
}

export function deletePayment(id: string) {
  const db = load();
  db.payments = db.payments.filter((item) => item.id !== id);
  save(db);
}

export function proofFilePath(screenshot: string) {
  return path.join(proofDir, path.basename(screenshot));
}
