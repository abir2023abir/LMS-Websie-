import { kvGet, kvSet } from '@/lib/kv-store';

// After 5 wrong tries from one address, that sign-in is locked for 15 minutes.
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
type Attempts = Record<string, { fails: number; first: number }>;

// Counts are kept in memory and also saved to the kv store so they survive cold
// starts. If saving fails (e.g. app_kv not set up yet) the in-memory count still
// applies and sign-in keeps working.
const memory = new Map<string, Attempts>();

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

function fresh(all: Attempts): Attempts {
  const now = Date.now();
  return Object.fromEntries(Object.entries(all).filter(([, entry]) => now - entry.first < WINDOW_MS));
}

async function liveAttempts(key: string): Promise<Attempts> {
  let stored: Attempts = {};
  try {
    stored = await kvGet<Attempts>(key, {});
  } catch {
    // fall back to memory only
  }
  const merged = { ...stored };
  for (const [ip, entry] of Object.entries(memory.get(key) || {})) {
    if (!merged[ip] || entry.fails > merged[ip].fails) merged[ip] = entry;
  }
  return fresh(merged);
}

async function save(key: string, attempts: Attempts) {
  memory.set(key, attempts);
  try {
    await kvSet(key, attempts);
  } catch (error) {
    console.error(`[login-limit] could not save "${key}", keeping count in memory:`, error);
  }
}

function minutesLeft(first: number) {
  const minutes = Math.ceil((first + WINDOW_MS - Date.now()) / 60000);
  return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

/** Returns a message when this address is locked out, or null when it may try. */
export async function loginLocked(key: string, ip: string): Promise<string | null> {
  const entry = (await liveAttempts(key))[ip];
  return entry && entry.fails >= MAX_FAILS ? minutesLeft(entry.first) : null;
}

/** Records a wrong try; returns how many tries are left (0 means now locked). */
export async function loginFailed(key: string, ip: string): Promise<number> {
  const attempts = await liveAttempts(key);
  const entry = attempts[ip];
  attempts[ip] = { fails: (entry?.fails || 0) + 1, first: entry?.first || Date.now() };
  await save(key, attempts);
  return Math.max(0, MAX_FAILS - attempts[ip].fails);
}

/** Clears the count after a successful sign-in. */
export async function loginSucceeded(key: string, ip: string) {
  const attempts = await liveAttempts(key);
  if (!attempts[ip]) return;
  delete attempts[ip];
  await save(key, attempts);
}

export function attemptsLeftMessage(left: number, base: string) {
  return left > 0 ? `${base} ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many attempts. Try again in 15 minutes.';
}
