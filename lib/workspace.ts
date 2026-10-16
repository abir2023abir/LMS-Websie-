const KEY = 'lms_client_workspace_v1';

export type CourseVisibility = 'published' | 'hidden' | 'archived';

export interface ExamQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  courseId?: string;
  lessonId?: string;
  kind?: 'mcq' | 'written' | 'short';
}

export interface ExamAttempt {
  id: string;
  email: string;
  score: number;
  total: number;
  at: string;
  written?: string;
  review?: string;
  appeal?: string;
  passed?: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  includes: string;
}

export interface ServiceDocument {
  name: string;
  version: number;
  at: string;
}

export interface QuoteVersion {
  scope: string;
  fee: number;
  deadline: string;
  at: string;
}

export interface ServiceBooking {
  id: string;
  email: string;
  business: string;
  packageId: string;
  status: 'requested' | 'quoted' | 'approved' | 'in_progress' | 'invoiced' | 'paid';
  documents: ServiceDocument[];
  quotes: QuoteVersion[];
  staff: string;
  deliverable: string;
  revisions: string[];
  scope: string;
  fee: number;
  deadline: string;
  at: string;
}

export interface InboxMessage {
  id: string;
  from: string;
  text: string;
  context: string;
  status: 'unanswered' | 'answered';
  reply?: string;
  channel?: 'student' | 'service';
  at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  kind: 'class' | 'exam' | 'meeting' | 'deadline';
  date: string;
  meet: string;
}

export interface Notice {
  id: string;
  text: string;
  read: boolean;
  role: string;
  href: string;
  at: string;
}

export interface MentorRecord {
  email: string;
  history: { email: string; at: string }[];
}

export interface AuditEntry {
  id: string;
  text: string;
  at: string;
}

export interface AssignmentNote {
  lessonId: string;
  email: string;
  text: string;
  status: 'submitted' | 'reviewed';
}

interface Store {
  watch: Record<string, number>;
  notes: Record<string, string>;
  assignments: AssignmentNote[];
  questions: ExamQuestion[];
  attempts: ExamAttempt[];
  packages: ServicePackage[];
  bookings: ServiceBooking[];
  messages: InboxMessage[];
  events: CalendarEvent[];
  notices: Notice[];
  audit: AuditEntry[];
  deactivated: string[];
  courseStatus: Record<string, CourseVisibility>;
  mentorLevel: Record<string, 'lead' | 'assistant'>;
  mentors: Record<string, MentorRecord>;
  discount: Record<string, number>;
  approval: Record<string, 'none' | 'pending' | 'approved'>;
  sessions: { email: string; at: string }[];
  courseEdits: Record<string, { title?: string; price?: number; videos: Record<string, string> }>;
}

function emptyStore(): Store {
  return {
    watch: {},
    notes: {},
    assignments: [],
    questions: [
      {
        id: 'q1',
        prompt: 'Which sentence is the most polite request?',
        choices: ['Give me the file.', 'Could you send me the file?', 'Send file now.', 'I want file.'],
        answer: 1,
      },
      {
        id: 'q2',
        prompt: 'A lesson stays locked until the previous video is watched enough.',
        choices: ['True', 'False'],
        answer: 0,
      },
    ],
    attempts: [],
    packages: [
      { id: 'basic', name: 'Basic', price: 5000, includes: 'Monthly books and one review' },
      { id: 'standard', name: 'Standard', price: 8000, includes: 'Books, tax file, and a monthly call' },
      { id: 'premium', name: 'Premium', price: 12000, includes: 'Full books, payroll, and priority replies' },
      { id: 'hourly', name: 'Hourly', price: 1500, includes: 'One hour of bookkeeping help' },
    ],
    bookings: [],
    messages: [],
    events: [],
    notices: [],
    audit: [],
    deactivated: [],
    courseStatus: {},
    mentorLevel: {},
    mentors: {},
    discount: {},
    approval: {},
    sessions: [],
    courseEdits: {},
  };
}

function load(): Store {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    const store = { ...emptyStore(), ...parsed } as Store;
    store.bookings = (store.bookings || []).map((item) => {
      const documents = (item.documents || []).map((doc) =>
        typeof doc === 'string' ? { name: doc, version: 1, at: item.at } : doc
      );
      return {
        ...item,
        documents,
        quotes: item.quotes?.length
          ? item.quotes
          : [{ scope: item.scope, fee: item.fee, deadline: item.deadline, at: item.at }],
        staff: item.staff || '',
        deliverable: item.deliverable || '',
        revisions: item.revisions || [],
      };
    });
    store.notices = (store.notices || []).map((item) => ({
      ...item,
      role: item.role || 'all',
      href: item.href || '',
    }));
    store.courseEdits = store.courseEdits || {};
    store.attempts = (store.attempts || []).map((item) => ({
      ...item,
      passed: typeof item.passed === 'boolean' ? item.passed : item.total > 0 && item.score * 2 >= item.total,
    }));
    return store;
  } catch {
    return emptyStore();
  }
}

function save(store: Store) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

function stamp() {
  return new Date().toISOString();
}

export function audit(text: string) {
  const store = load();
  store.audit.unshift({ id: `a-${Date.now()}`, text, at: stamp() });
  store.audit = store.audit.slice(0, 80);
  save(store);
}

export function listAudit(): AuditEntry[] {
  return load().audit;
}

export function isDeactivated(email: string) {
  return load().deactivated.includes(email.trim().toLowerCase());
}

export function deactivateEmail(email: string) {
  const store = load();
  const value = email.trim().toLowerCase();
  if (!value || store.deactivated.includes(value)) return;
  store.deactivated.push(value);
  save(store);
  audit(`Account deactivated: ${value}`);
}

export function recordWatch(lessonId: string, percent: number) {
  const store = load();
  const next = Math.max(store.watch[lessonId] || 0, Math.min(100, Math.round(percent)));
  if (next === store.watch[lessonId]) return;
  store.watch[lessonId] = next;
  save(store);
}

export function watchPercent(lessonId: string) {
  return load().watch[lessonId] || 0;
}

export function lessonNote(lessonId: string) {
  return load().notes[lessonId] || '';
}

export function saveLessonNote(lessonId: string, text: string) {
  const store = load();
  store.notes[lessonId] = text;
  save(store);
}

export function submitAssignment(lessonId: string, email: string, text: string) {
  const store = load();
  store.assignments.unshift({
    lessonId,
    email,
    text,
    status: 'submitted',
  });
  save(store);
  audit(`${email} submitted an assignment for ${lessonId}`);
}

export function assignmentsFor(lessonId: string) {
  return load().assignments.filter((item) => item.lessonId === lessonId);
}

export function questions() {
  return load().questions;
}

export function addQuestion(prompt: string, choices: string[], answer: number, kind: 'mcq' | 'written' | 'short' = 'mcq', lessonId?: string) {
  const store = load();
  store.questions.push({
    id: `q-${Date.now()}`,
    prompt,
    choices,
    answer,
    kind,
    lessonId,
  });
  save(store);
  audit('Question added to the bank');
}

export function paper(count: number) {
  const bank = [...load().questions];
  for (let i = bank.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  const size = Math.max(1, Math.min(count || bank.length, bank.length));
  return bank.slice(0, size);
}

export function submitExam(email: string, picks: number[], bank = load().questions, written = '') {
  const graded = bank.filter((question) => question.kind !== 'written');
  const total = graded.length;
  const score = graded.reduce((sum, question) => {
    const index = bank.findIndex((item) => item.id === question.id);
    return sum + (picks[index] === question.answer ? 1 : 0);
  }, 0);
  const passed = total > 0 && score * 2 >= total;
  const store = load();
  store.attempts.unshift({
    id: `e-${Date.now()}`,
    email,
    score,
    total,
    written,
    review: '',
    appeal: '',
    passed,
    at: stamp(),
  });
  store.notices.unshift({
    id: `n-${Date.now()}`,
    text: `${email} scored ${score}/${total} (${passed ? 'pass' : 'fail'})`,
    read: false,
    role: 'all',
    href: '/exams',
    at: stamp(),
  });
  save(store);
  audit(`${email} finished an exam: ${score}/${total}, ${passed ? 'pass' : 'fail'}`);
  return { score, total, passed };
}

export function reviewAttempt(id: string, review: string, passed: boolean) {
  const store = load();
  store.attempts = store.attempts.map((item) => (item.id === id ? { ...item, review, passed } : item));
  save(store);
  audit(`Exam ${id} reviewed: ${passed ? 'pass' : 'fail'}`);
}

export function appealAttempt(id: string, text: string) {
  const store = load();
  store.attempts = store.attempts.map((item) => (item.id === id ? { ...item, appeal: text } : item));
  save(store);
  audit(`Appeal filed on ${id}`);
}

export function attemptsFor(email: string) {
  return load().attempts.filter((item) => item.email.toLowerCase() === email.toLowerCase());
}

export function rankings() {
  const best = new Map<string, ExamAttempt>();
  for (const attempt of load().attempts) {
    const current = best.get(attempt.email);
    if (!current || attempt.score > current.score) best.set(attempt.email, attempt);
  }
  return Array.from(best.values()).sort((a, b) => b.score - a.score || a.email.localeCompare(b.email));
}

export function progressRankings() {
  if (typeof window === 'undefined') return [];
  const users = JSON.parse(localStorage.getItem('learnverse_registered_users') || '[]') as {
    email?: string;
    name?: string;
    uid?: string;
    role?: string;
    roles?: string[];
  }[];
  const progress = JSON.parse(localStorage.getItem('lms_student_progress_records') || '{}') as Record<
    string,
    { userId?: string; progressPercentage?: number }
  >;
  const rows = users
    .filter((user) => user.role === 'Student' || user.roles?.includes('Student') || !user.role)
    .map((user) => {
      const records = Object.values(progress).filter((item) => item.userId === user.uid);
      const percent = records.length
        ? Math.round(records.reduce((sum, item) => sum + (item.progressPercentage || 0), 0) / records.length)
        : 0;
      return { email: user.email || '', name: user.name || user.email || 'Student', progress: percent };
    })
    .filter((row) => row.email);
  return rows.sort((a, b) => b.progress - a.progress || a.email.localeCompare(b.email));
}

export function packages() {
  return load().packages;
}

export function updatePackage(id: string, price: number, includes: string) {
  const store = load();
  store.packages = store.packages.map((item) => (item.id === id ? { ...item, price, includes } : item));
  save(store);
}

export function bookingsFor(email?: string) {
  const all = load().bookings;
  if (!email) return all;
  return all.filter((item) => item.email === email.toLowerCase());
}

export function createBooking(email: string, business: string, packageId: string) {
  const store = load();
  const pack = store.packages.find((item) => item.id === packageId) || store.packages[0];
  const booking: ServiceBooking = {
    id: `b-${Date.now()}`,
    email: email.toLowerCase(),
    business,
    packageId: pack.id,
    status: 'quoted',
    documents: [],
    quotes: [{ scope: pack.includes, fee: pack.price, deadline: '7 days', at: stamp() }],
    staff: '',
    deliverable: '',
    revisions: [],
    scope: pack.includes,
    fee: pack.price,
    deadline: '7 days',
    at: stamp(),
  };
  store.bookings.unshift(booking);
  store.notices.unshift({
    id: `n-${Date.now()}`,
    text: `Quotation ready for ${business}`,
    read: false,
    role: 'ServiceCustomer',
    href: '/service',
    at: stamp(),
  });
  save(store);
  audit(`${email} requested ${pack.name} for ${business}`);
  return booking;
}

export function approveBooking(id: string) {
  const store = load();
  store.bookings = store.bookings.map((item) =>
    item.id === id ? { ...item, status: 'approved' } : item
  );
  save(store);
  audit(`Quotation approved: ${id}`);
}

export function addBookingDocument(id: string, name: string) {
  const store = load();
  store.bookings = store.bookings.map((item) => {
    if (item.id !== id) return item;
    const previous = item.documents.filter((doc) => doc.name === name);
    const version = previous.reduce((max, doc) => Math.max(max, doc.version), 0) + 1;
    return {
      ...item,
      documents: [...item.documents, { name, version, at: stamp() }],
      status: 'in_progress' as const,
    };
  });
  save(store);
  audit(`Document added to ${id}: ${name}`);
}

export function reviseQuote(id: string, scope: string, fee: number, deadline: string) {
  const store = load();
  store.bookings = store.bookings.map((item) => {
    if (item.id !== id) return item;
    const version = { scope, fee, deadline, at: stamp() };
    return { ...item, scope, fee, deadline, quotes: [...item.quotes, version], status: 'quoted' as const };
  });
  save(store);
  audit(`Quotation revised: ${id}`);
}

export function assignStaff(id: string, email: string) {
  const store = load();
  store.bookings = store.bookings.map((item) => (item.id === id ? { ...item, staff: email } : item));
  save(store);
  audit(`Staff ${email} assigned to ${id}`);
}

export function setDeliverable(id: string, text: string) {
  const store = load();
  store.bookings = store.bookings.map((item) => (item.id === id ? { ...item, deliverable: text } : item));
  save(store);
  audit(`Deliverable saved on ${id}`);
}

export function addRevision(id: string, text: string) {
  const store = load();
  store.bookings = store.bookings.map((item) =>
    item.id === id ? { ...item, revisions: [...item.revisions, text] } : item
  );
  save(store);
  audit(`Revision requested on ${id}`);
}

export function invoiceBooking(id: string) {
  const store = load();
  store.bookings = store.bookings.map((item) =>
    item.id === id ? { ...item, status: 'invoiced' } : item
  );
  save(store);
  audit(`Service invoice issued: ${id}`);
}

export function payBooking(id: string) {
  const store = load();
  store.bookings = store.bookings.map((item) =>
    item.id === id ? { ...item, status: 'paid' } : item
  );
  save(store);
  audit(`Service invoice paid: ${id}`);
}

export function messages() {
  return load().messages;
}

export function visibleMessages(scope: 'own' | 'student' | 'service' | 'care' | 'all', email = '') {
  return load().messages.filter((item) => {
    const channel = item.channel || (item.context === 'Service' ? 'service' : 'student');
    if (scope === 'all' || scope === 'care') return true;
    if (scope === 'student') return channel === 'student';
    if (scope === 'service') return channel === 'service';
    return item.from.toLowerCase() === email.toLowerCase();
  });
}

export function sendMessage(from: string, text: string, context: string) {
  const store = load();
  const channel = context === 'Service' ? 'service' : 'student';
  store.messages.unshift({
    id: `m-${Date.now()}`,
    from,
    text,
    context,
    status: 'unanswered',
    reply: '',
    channel,
    at: stamp(),
  });
  store.notices.unshift({
    id: `n-${Date.now()}`,
    text: `New ${context} message from ${from}`,
    read: false,
    role: channel === 'service' ? 'ServiceCustomer' : 'Instructor',
    href: channel === 'service' ? '/service' : '/teacher',
    at: stamp(),
  });
  save(store);
  audit(`Message from ${from} about ${context}`);
}

export function answerMessage(id: string, reply = 'Answered') {
  const store = load();
  store.messages = store.messages.map((item) =>
    item.id === id ? { ...item, status: 'answered', reply } : item
  );
  save(store);
  audit(`Message answered: ${id}`);
}

export function deleteMessage(id: string) {
  const store = load();
  store.messages = store.messages.filter((item) => item.id !== id);
  save(store);
  audit(`Message deleted: ${id}`);
}

export function events() {
  return load().events.slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function addEvent(title: string, kind: CalendarEvent['kind'], date: string, meet: string) {
  const store = load();
  store.events.push({ id: `c-${Date.now()}`, title, kind, date, meet });
  store.notices.unshift({
    id: `n-${Date.now()}`,
    text: `${kind} set: ${title} on ${date}`,
    read: false,
    role: 'all',
    href: '/calendar',
    at: stamp(),
  });
  save(store);
  audit(`Calendar: ${title}`);
}

export function notices() {
  return load().notices;
}

export function markNoticeRead(id: string) {
  const store = load();
  store.notices = store.notices.map((item) => (item.id === id ? { ...item, read: true } : item));
  save(store);
}

export function courseVisibility(id: string): CourseVisibility {
  return load().courseStatus[id] || 'published';
}

export function setCourseVisibility(id: string, status: CourseVisibility) {
  const store = load();
  store.courseStatus[id] = status;
  save(store);
  audit(`Course ${id} set to ${status}`);
}

export function hiddenCourseIds() {
  const status = load().courseStatus;
  return Object.entries(status)
    .filter(([, value]) => value === 'archived' || value === 'hidden')
    .map(([id]) => id);
}

export function setMentorLevel(email: string, level: 'lead' | 'assistant') {
  const store = load();
  store.mentorLevel[email.toLowerCase()] = level;
  save(store);
  audit(`${email} mentor level set to ${level}`);
}

export function mentorLevel(email: string) {
  return load().mentorLevel[email.toLowerCase()] || 'lead';
}

export function assignMentor(courseId: string, email: string) {
  const store = load();
  const current = store.mentors[courseId] || { email: '', history: [] };
  current.history.unshift({ email, at: stamp() });
  current.email = email;
  store.mentors[courseId] = current;
  save(store);
  audit(`Mentor ${email} assigned to course ${courseId}`);
}

export function mentorFor(courseId: string) {
  return load().mentors[courseId] || { email: '', history: [] };
}

export function setDiscount(courseId: string, percent: number) {
  const store = load();
  store.discount[courseId] = Math.max(0, Math.min(90, Math.round(percent)));
  save(store);
  audit(`Discount on ${courseId}: ${store.discount[courseId]}%`);
}

export function courseDiscount(courseId: string) {
  return load().discount[courseId] || 0;
}

export function setApproval(courseId: string, status: 'none' | 'pending' | 'approved') {
  const store = load();
  store.approval[courseId] = status;
  save(store);
  audit(`Course ${courseId} approval: ${status}`);
}

export function courseApproval(courseId: string) {
  return load().approval[courseId] || 'none';
}

export function recordSession(email: string) {
  const store = load();
  store.sessions.unshift({ email: email.toLowerCase(), at: stamp() });
  store.sessions = store.sessions.slice(0, 40);
  save(store);
  audit(`Login: ${email}`);
}

export function sessions() {
  return load().sessions;
}

export function allAssignments() {
  return load().assignments;
}

export function courseEdit(courseId: string) {
  return load().courseEdits[courseId] || { videos: {} };
}

export function saveCourseMeta(courseId: string, title: string, price: number) {
  const store = load();
  const current = store.courseEdits[courseId] || { videos: {} };
  store.courseEdits[courseId] = { ...current, title, price };
  save(store);
  audit(`Course ${courseId} edited`);
}

export function saveLessonVideo(courseId: string, lessonId: string, url: string) {
  const store = load();
  const current = store.courseEdits[courseId] || { videos: {} };
  current.videos = { ...current.videos, [lessonId]: url };
  store.courseEdits[courseId] = current;
  save(store);
  audit(`Video set for ${courseId} / ${lessonId}`);
}

export function lessonVideo(courseId: string, lessonId: string) {
  return load().courseEdits[courseId]?.videos?.[lessonId] || '';
}

export function reviewAssignment(lessonId: string, email: string, review: string) {
  const store = load();
  store.assignments = store.assignments.map((item) =>
    item.lessonId === lessonId && item.email === email ? { ...item, status: 'reviewed', text: `${item.text}\nReview: ${review}` } : item
  );
  save(store);
  audit(`Assignment reviewed for ${email}`);
}
