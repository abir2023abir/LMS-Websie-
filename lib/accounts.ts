import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dataPath } from '@/lib/data-dir';

export type Role = 'Student' | 'Instructor' | 'Guardian' | 'ServiceCustomer';
export const ROLES: Role[] = ['Student', 'Instructor', 'Guardian', 'ServiceCustomer'];

export type Profile = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  roles: Role[];
  active_role: Role;
  disabled: boolean;
  mentor_level?: MentorLevel;
  created_at: string;
};

export type MentorLevel = 'lead' | 'assistant';
export type Visibility = 'published' | 'hidden' | 'archived';
export type Approval = 'none' | 'pending' | 'approved';

export type CourseSettings = {
  course_id: string;
  visibility: Visibility;
  approval: Approval;
  discount: number;
  mentor_email: string;
  mentor_history: { email: string; at: string }[];
  updated_by: string | null;
  updated_at: string;
};

export type StudentProgress = {
  student_id: string;
  course_id: string;
  percent: number;
  completed_lessons: number;
  total_lessons: number;
  updated_at: string;
};

export type StudentResult = {
  id: string;
  student_id: string;
  kind: 'exam' | 'quiz';
  label: string;
  score: number;
  total: number;
  passed: boolean;
  review: string;
  graded_by: string | null;
  at: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  kind: 'class' | 'exam' | 'meeting' | 'deadline';
  date: string;
  meet: string;
  created_by: string | null;
  created_at: string;
};

export type LinkStatus = 'pending' | 'approved' | 'rejected';

export type GuardianLink = {
  id: string;
  guardian_id: string;
  student_email: string;
  status: LinkStatus;
  decided_by: string | null;
  created_at: string;
  decided_at: string | null;
};

type Tables = {
  profiles: Profile;
  guardian_links: GuardianLink;
  attendance: { student_id: string; day: string };
  course_settings: CourseSettings;
  student_progress: StudentProgress;
  student_results: StudentResult;
  calendar_events: CalendarEvent;
};
type Table = keyof Tables;

const KEYS: Record<Table, string[]> = {
  profiles: ['email'],
  guardian_links: ['guardian_id', 'student_email'],
  attendance: ['student_id', 'day'],
  course_settings: ['course_id'],
  student_progress: ['student_id', 'course_id'],
  student_results: ['id'],
  calendar_events: ['id'],
};
type Filter = Record<string, string | boolean>;

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);
const file = dataPath('accounts.json');

function headers(extra: Record<string, string> = {}): Record<string, string> {
  // New sb_secret_ keys are not JWTs and must only go in the apikey header.
  const legacyJwt = supabaseKey!.startsWith('eyJ');
  return {
    apikey: supabaseKey!,
    ...(legacyJwt ? { Authorization: `Bearer ${supabaseKey}` } : {}),
    'Content-Type': 'application/json',
    ...extra,
  };
}

function query(filter: Filter) {
  return Object.entries(filter)
    .map(([key, value]) => `${key}=eq.${encodeURIComponent(String(value))}`)
    .join('&');
}

async function rest<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: 'no-store' }).catch(() => null);
  if (!res) throw new Error('Cannot reach Supabase. Check SUPABASE_URL in Vercel.');
  if (res.status === 404) throw new Error('Supabase table missing. Run supabase/phase1_accounts.sql and supabase/phase1_mentors.sql in the SQL Editor.');
  if (res.status === 401 || res.status === 403) throw new Error('Supabase rejected the key. Check SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  if (res.status === 409) throw new Error('duplicate');
  if (!res.ok) throw new Error(`Supabase request failed (${res.status})`);
  const text = await res.text();
  return (text ? JSON.parse(text) : []) as T;
}

type FileDb = { [K in Table]: Tables[K][] };

function emptyDb(): FileDb {
  return { profiles: [], guardian_links: [], attendance: [], course_settings: [], student_progress: [], student_results: [], calendar_events: [] };
}

function readFile(): FileDb {
  try {
    return { ...emptyDb(), ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return emptyDb();
  }
}

function writeFile(db: FileDb) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function matches(row: object, filter: Filter) {
  return Object.entries(filter).every(([key, value]) => (row as Record<string, unknown>)[key] === value);
}

async function select<T extends Table>(table: T, filter: Filter = {}): Promise<Tables[T][]> {
  if (useSupabase) {
    try {
      return await rest(`${supabaseUrl}/rest/v1/${table}?select=*&${query(filter)}`, { headers: headers() });
    } catch (error: any) {
      // A table from a later SQL file reads as empty until that file is run; writes still report it.
      if (String(error.message).startsWith('Supabase table missing')) {
        console.error(`[accounts] ${table}: ${error.message}`);
        return [];
      }
      throw error;
    }
  }
  return readFile()[table].filter((row) => matches(row, filter)) as Tables[T][];
}

type OnClash = 'error' | 'ignore' | 'merge';

async function insert<T extends Table>(table: T, row: Tables[T], onClash: OnClash = 'error'): Promise<void> {
  const key = KEYS[table];
  if (useSupabase) {
    const prefer = onClash === 'ignore' ? 'resolution=ignore-duplicates' : onClash === 'merge' ? 'resolution=merge-duplicates' : 'return=minimal';
    const conflict = onClash === 'error' ? '' : `?on_conflict=${key.join(',')}`;
    await rest(`${supabaseUrl}/rest/v1/${table}${conflict}`, {
      method: 'POST',
      headers: headers({ Prefer: prefer }),
      body: JSON.stringify(row),
    });
    return;
  }
  const db = readFile();
  const rows = db[table] as Tables[T][];
  const same = (item: Tables[T]) => key.every((k) => (item as Record<string, unknown>)[k] === (row as Record<string, unknown>)[k]);
  const index = rows.findIndex(same);
  if (index >= 0) {
    if (onClash === 'ignore') return;
    if (onClash === 'error') throw new Error('duplicate');
    rows[index] = { ...rows[index], ...row };
  } else {
    rows.push(row);
  }
  writeFile(db);
}

async function update<T extends Table>(table: T, filter: Filter, patch: Partial<Tables[T]>): Promise<void> {
  if (useSupabase) {
    await rest(`${supabaseUrl}/rest/v1/${table}?${query(filter)}`, {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify(patch),
    });
    return;
  }
  const db = readFile();
  db[table] = (db[table] as Tables[T][]).map((row) => (matches(row, filter) ? { ...row, ...patch } : row)) as FileDb[T];
  writeFile(db);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const given = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function publicProfile(profile: Profile) {
  const { password_hash: _hidden, ...rest } = profile;
  return rest;
}

export async function profileByEmail(email: string) {
  return (await select('profiles', { email: normalizeEmail(email) }))[0] || null;
}

export async function profileById(id: string) {
  return (await select('profiles', { id }))[0] || null;
}

export async function listProfiles() {
  return select('profiles');
}

export async function createProfile(input: { email: string; name: string; password: string; role: Role }) {
  const profile: Profile = {
    id: crypto.randomUUID(),
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    password_hash: hashPassword(input.password),
    roles: [input.role],
    active_role: input.role,
    disabled: false,
    created_at: new Date().toISOString(),
  };
  await insert('profiles', profile);
  return profile;
}

export async function updateProfile(id: string, patch: Partial<Pick<Profile, 'roles' | 'active_role' | 'disabled' | 'name' | 'mentor_level'>>) {
  await update('profiles', { id }, patch);
}

export async function requestGuardianLink(guardianId: string, studentEmail: string) {
  const email = normalizeEmail(studentEmail);
  const existing = (await select('guardian_links', { guardian_id: guardianId, student_email: email }))[0];
  if (existing) return existing;
  const link: GuardianLink = {
    id: crypto.randomUUID(),
    guardian_id: guardianId,
    student_email: email,
    status: 'pending',
    decided_by: null,
    created_at: new Date().toISOString(),
    decided_at: null,
  };
  await insert('guardian_links', link);
  return link;
}

export async function linksForGuardian(guardianId: string) {
  return select('guardian_links', { guardian_id: guardianId });
}

export async function linksForStudent(studentEmail: string) {
  return select('guardian_links', { student_email: normalizeEmail(studentEmail) });
}

export async function linkById(id: string) {
  return (await select('guardian_links', { id }))[0] || null;
}

export async function listLinks() {
  return select('guardian_links');
}

export async function decideLink(id: string, status: LinkStatus, decidedBy: string) {
  await update('guardian_links', { id }, { status, decided_by: decidedBy, decided_at: new Date().toISOString() });
}

export async function approvedStudentFor(guardianId: string) {
  const link = (await select('guardian_links', { guardian_id: guardianId, status: 'approved' }))[0];
  if (!link) return null;
  const student = await profileByEmail(link.student_email);
  return student && !student.disabled ? student : null;
}

export async function markAttendance(studentId: string) {
  const day = new Date().toISOString().slice(0, 10);
  await insert('attendance', { student_id: studentId, day }, 'ignore');
}

export async function attendanceFor(studentId: string) {
  return (await select('attendance', { student_id: studentId })).map((row) => row.day).sort();
}

export function defaultCourseSettings(courseId: string): CourseSettings {
  return {
    course_id: courseId,
    visibility: 'published',
    approval: 'none',
    discount: 0,
    mentor_email: '',
    mentor_history: [],
    updated_by: null,
    updated_at: new Date().toISOString(),
  };
}

export async function listCourseSettings() {
  return select('course_settings');
}

export async function courseSettings(courseId: string) {
  return (await select('course_settings', { course_id: courseId }))[0] || defaultCourseSettings(courseId);
}

export async function saveCourseSettings(next: CourseSettings) {
  await insert('course_settings', { ...next, updated_at: new Date().toISOString() }, 'merge');
}

// Changing the mentor only touches course_settings; results and messages stay keyed to the student.
export async function assignCourseMentor(courseId: string, mentorEmail: string, by: string) {
  const current = await courseSettings(courseId);
  const email = normalizeEmail(mentorEmail);
  const history = [{ email, at: new Date().toISOString() }, ...current.mentor_history];
  await saveCourseSettings({ ...current, mentor_email: email, mentor_history: history, updated_by: by });
}

export async function saveProgress(row: Omit<StudentProgress, 'updated_at'>) {
  await insert('student_progress', { ...row, updated_at: new Date().toISOString() }, 'merge');
}

export async function progressFor(studentId: string) {
  return select('student_progress', { student_id: studentId });
}

export async function saveResult(row: StudentResult) {
  await insert('student_results', row, 'merge');
}

export async function resultById(id: string) {
  return (await select('student_results', { id }))[0] || null;
}

export async function reviewResult(id: string, passed: boolean, review: string, gradedBy: string) {
  await update('student_results', { id }, { passed, review, graded_by: gradedBy });
}

export async function resultsFor(studentId: string) {
  return (await select('student_results', { student_id: studentId })).sort((a, b) => b.at.localeCompare(a.at));
}

export async function addCalendarEvent(row: CalendarEvent) {
  await insert('calendar_events', row, 'merge');
}

export async function upcomingExams() {
  const today = new Date().toISOString().slice(0, 10);
  return (await select('calendar_events', { kind: 'exam' }))
    .filter((row) => String(row.date).slice(0, 10) >= today)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
