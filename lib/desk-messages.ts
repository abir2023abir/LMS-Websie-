import fs from 'fs';
import { dataPath } from '@/lib/data-dir';
import { kvGet, kvSet } from '@/lib/kv-store';

// Course questions and consultation requests. Stored with kv-store so they survive
// Vercel restarts; the old local desk-messages.json is read once as a fallback.
const legacyFile = dataPath('desk-messages.json');
const KEY = 'desk-messages';
const CONSULTATION_TIMES = ['9:15 am', '9:30 am', '9:45 am', '10:00 am', '10:15 am', '10:30 am', '1:00 pm', '1:30 pm', '2:00 pm', '3:00 pm', '4:00 pm'];

export type DeskKind = 'student' | 'service';

export type DeskNote = {
  id: string;
  from: 'sender' | 'admin' | 'instructor';
  text: string;
  at: string;
};

export type DeskThread = {
  id: string;
  kind: DeskKind;
  name: string;
  email: string;
  status: 'open' | 'replied';
  createdAt: string;
  messages: DeskNote[];
  courseId: string;
  courseTitle: string;
  rank: number;
  rankTotal: number;
  progress: number;
  instructorId: string;
  instructorName: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  phone: string;
  topic: string;
  billing: string;
  appointmentDate: string;
  appointmentTime: string;
  company: string;
  monthlyRevenue: string;
};

function asThread(item: Partial<DeskThread>): DeskThread {
  return {
    id: String(item.id || ''),
    kind: item.kind === 'service' ? 'service' : 'student',
    name: String(item.name || ''),
    email: String(item.email || ''),
    status: item.status === 'replied' ? 'replied' : 'open',
    createdAt: String(item.createdAt || ''),
    messages: Array.isArray(item.messages) ? item.messages : [],
    courseId: String(item.courseId || ''),
    courseTitle: String(item.courseTitle || ''),
    rank: Number(item.rank) || 0,
    rankTotal: Number(item.rankTotal) || 0,
    progress: Number(item.progress) || 0,
    instructorId: String(item.instructorId || ''),
    instructorName: String(item.instructorName || ''),
    moduleTitle: String(item.moduleTitle || ''),
    lessonId: String(item.lessonId || ''),
    lessonTitle: String(item.lessonTitle || ''),
    phone: String(item.phone || ''),
    topic: String(item.topic || ''),
    billing: String(item.billing || ''),
    appointmentDate: String(item.appointmentDate || ''),
    appointmentTime: String(item.appointmentTime || ''),
    company: String(item.company || ''),
    monthlyRevenue: String(item.monthlyRevenue || ''),
  };
}

function readLegacy(): Partial<DeskThread>[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function read(): Promise<DeskThread[]> {
  const saved = await kvGet<Partial<DeskThread>[] | null>(KEY, null);
  return (Array.isArray(saved) ? saved : readLegacy()).map((item) => asThread(item));
}

async function write(list: DeskThread[]) {
  await kvSet(KEY, list);
}

export async function listDeskThreads() {
  return (await read()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function bookedTimesOn(date: string) {
  return (await read()).filter((item) => item.kind === 'service' && item.appointmentDate === date).map((item) => item.appointmentTime);
}

export async function getDeskThread(id: string) {
  return (await read()).find((item) => item.id === id) || null;
}

/** A student's own questions, optionally for one lesson. */
export async function studentThreads(email: string, courseId?: string, lessonId?: string) {
  const owner = email.trim().toLowerCase();
  return (await listDeskThreads()).filter((item) => item.kind === 'student'
    && item.email.toLowerCase() === owner
    && (!courseId || item.courseId === courseId)
    && (!lessonId || item.lessonId === lessonId));
}

export async function openDeskThread(input: {
  kind: DeskKind;
  name: string;
  email: string;
  text: string;
  courseId?: string;
  courseTitle?: string;
  rank?: number;
  rankTotal?: number;
  progress?: number;
  instructorId?: string;
  instructorName?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  phone?: string;
  topic?: string;
  billing?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  company?: string;
  monthlyRevenue?: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim();
  const text = input.text.trim();
  if (!name || !email || !text) throw new Error('Name, email, and a message are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.');
  if (input.kind === 'service' && (!input.phone?.trim() || !input.topic?.trim() || !input.appointmentDate || !input.appointmentTime)) {
    throw new Error('Choose a time, tell us what you need, and provide a phone number.');
  }
  if (input.kind === 'service') {
    const date = String(input.appointmentDate);
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || !CONSULTATION_TIMES.includes(String(input.appointmentTime))) {
      throw new Error('Choose one of the available dates and times.');
    }
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
    if (date < today) throw new Error('Choose a future date.');
    if (date === today) {
      const slot = String(input.appointmentTime).match(/^(\d{1,2}):(\d{2}) (am|pm)$/);
      const current = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
      const [hourNow, minuteNow] = current.split(':').map(Number);
      if (slot) {
        let hour = Number(slot[1]) % 12;
        if (slot[3] === 'pm') hour += 12;
        if (hour * 60 + Number(slot[2]) <= hourNow * 60 + minuteNow) throw new Error('That time has already passed. Choose another time.');
      }
    }
  }
  if (input.kind === 'service' && (await bookedTimesOn(input.appointmentDate!)).includes(input.appointmentTime!)) {
    throw new Error('That time was just requested. Please choose another available time.');
  }
  const now = new Date().toISOString();
  const thread: DeskThread = {
    id: `msg-${Date.now().toString(36)}`,
    kind: input.kind === 'service' ? 'service' : 'student',
    name,
    email,
    status: 'open',
    createdAt: now,
    messages: [{ id: `note-${Date.now().toString(36)}`, from: 'sender', text, at: now }],
    courseId: String(input.courseId || ''),
    courseTitle: String(input.courseTitle || '').trim(),
    rank: Number(input.rank) || 0,
    rankTotal: Number(input.rankTotal) || 0,
    progress: Number(input.progress) || 0,
    instructorId: String(input.instructorId || ''),
    instructorName: String(input.instructorName || '').trim(),
    moduleTitle: String(input.moduleTitle || '').trim(),
    lessonId: String(input.lessonId || '').trim(),
    lessonTitle: String(input.lessonTitle || '').trim(),
    phone: String(input.phone || '').trim(),
    topic: String(input.topic || '').trim(),
    billing: String(input.billing || '').trim(),
    appointmentDate: String(input.appointmentDate || '').trim(),
    appointmentTime: String(input.appointmentTime || '').trim(),
    company: String(input.company || '').trim(),
    monthlyRevenue: String(input.monthlyRevenue || '').trim(),
  };
  await write([thread, ...(await read())]);
  return thread;
}

export async function replyDeskThread(id: string, text: string, from: 'admin' | 'instructor' = 'admin') {
  const clean = text.trim();
  if (!clean) throw new Error('Write a reply first.');
  const list = await read();
  const current = list.find((item) => item.id === id);
  if (!current) throw new Error('Message not found.');
  const next: DeskThread = {
    ...current,
    status: 'replied',
    messages: [...current.messages, { id: `note-${Date.now().toString(36)}`, from, text: clean, at: new Date().toISOString() }],
  };
  await write(list.map((item) => (item.id === id ? next : item)));
  return next;
}

export async function continueDeskThread(id: string, email: string, text: string) {
  const clean = text.trim();
  if (!clean) throw new Error('Write a message first.');
  const list = await read();
  const current = list.find((item) => item.id === id);
  if (!current || current.email.toLowerCase() !== email.trim().toLowerCase()) throw new Error('Message not found.');
  const next: DeskThread = {
    ...current,
    status: 'open',
    messages: [...current.messages, { id: `note-${Date.now().toString(36)}`, from: 'sender', text: clean, at: new Date().toISOString() }],
  };
  await write(list.map((item) => (item.id === id ? next : item)));
  return next;
}
