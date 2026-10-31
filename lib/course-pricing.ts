import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import { getFallbackCourseData } from '@/lib/progress';
import { listCourseEdits } from '@/lib/course-edits';
import { courseSettings } from '@/lib/accounts';
import { usdToBdt } from '@/lib/utils';

/**
 * The amount a student must pay for a course, worked out on the server so the
 * browser can never choose its own price. Prices are stored in USD and charged
 * in Taka, after any admin price edit and course discount.
 */
export async function coursePrice(courseId: string): Promise<{ courseId: string; title: string; amount: number } | null> {
  let course = await getCourseById(courseId).catch(() => null);
  if (!course && featuredCourses.some((c) => c.id === courseId)) course = getFallbackCourseData(courseId);
  if (!course) return null;

  const edit = (await listCourseEdits().catch(() => ({} as Awaited<ReturnType<typeof listCourseEdits>>)))[courseId];
  const usd = typeof edit?.price === 'number' ? edit.price : course.price || 0;
  const settings = await courseSettings(courseId).catch(() => null);
  if (settings && settings.visibility && settings.visibility !== 'published') return null;
  const discount = Math.min(100, Math.max(0, Number(settings?.discount) || 0));
  const discountedUsd = Math.max(0, Math.round((usd * (100 - discount)) / 100));

  return { courseId, title: edit?.title || course.title, amount: usdToBdt(discountedUsd) };
}
