import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';

const file = dataPath('desk-messages.json');

export type DeskKind = 'student' | 'service';

export type DeskNote = {
  id: string;
  from: 'sender' | 'admin';
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
  };
}

function read(): DeskThread[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed.map((item) => asThread(item)) : [];
  } catch {
    return [];
  }
}

function write(list: DeskThread[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

export function listDeskThreads() {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getDeskThread(id: string) {
  return read().find((item) => item.id === id) || null;
}

export function openDeskThread(input: {
  kind: DeskKind;
  name: string;
  email: string;
  text: string;
  courseId?: string;
  courseTitle?: string;
  rank?: number;
  rankTotal?: number;
  progress?: number;
}) {
  const name = input.name.trim();
  const email = input.email.trim();
  const text = input.text.trim();
  if (!name || !email || !text) throw new Error('Name, email, and a message are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.');
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
  };
  write([thread, ...read()]);
  return thread;
}

export function replyDeskThread(id: string, text: string) {
  const clean = text.trim();
  if (!clean) throw new Error('Write a reply first.');
  const list = read();
  const current = list.find((item) => item.id === id);
  if (!current) throw new Error('Message not found.');
  const next: DeskThread = {
    ...current,
    status: 'replied',
    messages: [...current.messages, { id: `note-${Date.now().toString(36)}`, from: 'admin', text: clean, at: new Date().toISOString() }],
  };
  write(list.map((item) => (item.id === id ? next : item)));
  return next;
}

export function continueDeskThread(id: string, email: string, text: string) {
  const clean = text.trim();
  if (!clean) throw new Error('Write a message first.');
  const list = read();
  const current = list.find((item) => item.id === id);
  if (!current || current.email.toLowerCase() !== email.trim().toLowerCase()) throw new Error('Message not found.');
  const next: DeskThread = {
    ...current,
    status: 'open',
    messages: [...current.messages, { id: `note-${Date.now().toString(36)}`, from: 'sender', text: clean, at: new Date().toISOString() }],
  };
  write(list.map((item) => (item.id === id ? next : item)));
  return next;
}
