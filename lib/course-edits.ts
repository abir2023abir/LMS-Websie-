import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';

export type CourseEdit = {
  title?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  level?: string;
  description?: string;
  thumbnail?: string;
  videos?: Record<string, string>;
  updatedAt?: string;
};

const file = dataPath('course-edits.json');
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

function headers() {
  return {
    apikey: supabaseKey!,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  };
}

function readFile(): Record<string, CourseEdit> {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

export async function listCourseEdits(): Promise<Record<string, CourseEdit>> {
  if (!useSupabase) return readFile();
  const res = await fetch(`${supabaseUrl}/rest/v1/course_edits?select=course_id,data`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`Supabase read failed (${res.status})`);
  const rows = (await res.json()) as { course_id: string; data: CourseEdit }[];
  return Object.fromEntries(rows.map((row) => [row.course_id, row.data]));
}

export async function saveCourseEdit(courseId: string, patch: CourseEdit): Promise<CourseEdit> {
  const all = await listCourseEdits();
  const next: CourseEdit = {
    ...all[courseId],
    ...patch,
    videos: { ...all[courseId]?.videos, ...patch.videos },
    updatedAt: new Date().toISOString(),
  };

  if (useSupabase) {
    const res = await fetch(`${supabaseUrl}/rest/v1/course_edits?on_conflict=course_id`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ course_id: courseId, data: next, updated_at: next.updatedAt }),
    });
    if (!res.ok) throw new Error(`Supabase write failed (${res.status})`);
    return next;
  }

  all[courseId] = next;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all, null, 2));
  return next;
}
