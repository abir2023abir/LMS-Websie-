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

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  if (!useSupabase) return readFile(key, fallback);
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

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!useSupabase) return writeFile(key, value);
  const res = await fetch(`${supabaseUrl}/rest/v1/app_kv?on_conflict=key`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, data: value, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Could not save "${key}" (status ${res.status}). Run supabase/app_kv.sql first.`);
}
