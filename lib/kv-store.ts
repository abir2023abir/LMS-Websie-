import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';

// Small persistent key → JSON store. Uses the Supabase `app_kv` table when the
// service role key is configured (required on Vercel, where local files are
// wiped between cold starts) and a local JSON file otherwise.
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

function headers(): Record<string, string> {
  // New sb_secret_ keys are not JWTs and must only go in the apikey header.
  const legacyJwt = supabaseKey!.startsWith('eyJ');
  return {
    apikey: supabaseKey!,
    ...(legacyJwt ? { Authorization: `Bearer ${supabaseKey}` } : {}),
    'Content-Type': 'application/json',
  };
}

const fileFor = (key: string) => dataPath(`kv-${key.replace(/[^a-z0-9_-]/gi, '_')}.json`);

function readFile<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(fileFor(key), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeFile(key: string, value: unknown) {
  const file = fileFor(key);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

// Short in-memory cache so one page load (or a ranking of many students) reads each
// key once instead of dozens of times. Writes update the cache immediately.
const CACHE_MS = 5000;
const cache = new Map<string, { at: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

async function readRemote<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/app_kv?key=eq.${encodeURIComponent(key)}&select=data`, { headers: headers(), cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const rows = (await res.json()) as { data: T }[];
    return rows[0]?.data ?? fallback;
  } catch (error) {
    console.error(`[kv-store] Supabase read of "${key}" failed, using local file:`, error);
    return readFile(key, fallback);
  }
}

// Callers often change what they read; hand each one its own copy.
const copy = <T>(value: T): T => (value === null || typeof value !== 'object' ? value : structuredClone(value));

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return copy((hit.value ?? fallback) as T);
  let pending = inflight.get(key) as Promise<T | null> | undefined;
  if (!pending) {
    pending = (useSupabase ? readRemote<T | null>(key, null) : Promise.resolve(readFile<T | null>(key, null)))
      .then((value) => { cache.set(key, { at: Date.now(), value }); return value; })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  const value = await pending;
  return copy((value ?? fallback) as T);
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!useSupabase) {
    writeFile(key, value);
  } else {
    const res = await fetch(`${supabaseUrl}/rest/v1/app_kv?on_conflict=key`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key, data: value, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`Could not save "${key}" (status ${res.status}). Run supabase/app_kv.sql first.`);
  }
  cache.set(key, { at: Date.now(), value: copy(value) });
}
