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
};
type Table = keyof Tables;
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
  if (res.status === 404) throw new Error('Supabase table missing. Run supabase/phase1_accounts.sql in the SQL Editor.');
  if (res.status === 401 || res.status === 403) throw new Error('Supabase rejected the key. Check SUPABASE_SERVICE_ROLE_KEY in Vercel.');
  if (res.status === 409) throw new Error('duplicate');
  if (!res.ok) throw new Error(`Supabase request failed (${res.status})`);
  const text = await res.text();
  return (text ? JSON.parse(text) : []) as T;
}

type FileDb = { [K in Table]: Tables[K][] };

function readFile(): FileDb {
  try {
    return { profiles: [], guardian_links: [], attendance: [], ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    return { profiles: [], guardian_links: [], attendance: [] };
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
    return rest(`${supabaseUrl}/rest/v1/${table}?select=*&${query(filter)}`, { headers: headers() });
  }
  return readFile()[table].filter((row) => matches(row, filter)) as Tables[T][];
}

async function insert<T extends Table>(table: T, row: Tables[T], ignoreDuplicate = false): Promise<void> {
  if (useSupabase) {
    const prefer = ignoreDuplicate ? 'resolution=ignore-duplicates' : 'return=minimal';
    const conflict = table === 'attendance' ? '?on_conflict=student_id,day' : '';
    await rest(`${supabaseUrl}/rest/v1/${table}${conflict}`, {
      method: 'POST',
      headers: headers({ Prefer: prefer }),
      body: JSON.stringify(row),
    });
    return;
  }
  const db = readFile();
  const rows = db[table] as Tables[T][];
  const key = table === 'attendance' ? ['student_id', 'day'] : table === 'profiles' ? ['email'] : ['guardian_id', 'student_email'];
  const clash = rows.some((item) => key.every((k) => (item as Record<string, unknown>)[k] === (row as Record<string, unknown>)[k]));
  if (clash) {
    if (ignoreDuplicate) return;
    throw new Error('duplicate');
  }
  rows.push(row);
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

export async function updateProfile(id: string, patch: Partial<Pick<Profile, 'roles' | 'active_role' | 'disabled' | 'name'>>) {
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
  return profileByEmail(link.student_email);
}

export async function markAttendance(studentId: string) {
  const day = new Date().toISOString().slice(0, 10);
  await insert('attendance', { student_id: studentId, day }, true);
}

export async function attendanceFor(studentId: string) {
  return (await select('attendance', { student_id: studentId })).map((row) => row.day).sort();
}
