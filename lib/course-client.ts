import type { CourseSchema } from '@/types/course';

/** Browser-side course lookup through the API (lib/db is server-only). */
export async function getCourseById(courseId: string): Promise<CourseSchema | null> {
  try {
    const res = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.course || null;
  } catch {
    return null;
  }
}
