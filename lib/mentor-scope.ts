import { isAdminSession } from '@/lib/admin-guard';
import { listCourseSettings } from '@/lib/accounts';
import { getCoursesByInstructor } from '@/lib/db';
import { currentProfile } from '@/lib/user-session';

/**
 * The courses a signed-in mentor may work on: courses assigned to them by the admin,
 * plus courses they created. Returns null for the admin, who sees everything.
 */
export async function mentorCourseScope(): Promise<Set<string> | null> {
  if (isAdminSession()) return null;
  const profile = await currentProfile();
  if (!profile) return new Set();
  const email = profile.email.toLowerCase();
  const [settings, own] = await Promise.all([listCourseSettings(), getCoursesByInstructor(profile.id)]);
  const ids = new Set<string>(own.map((course) => course.id).filter((id): id is string => Boolean(id)));
  for (const row of settings) {
    if (row.mentor_email && row.mentor_email.toLowerCase() === email) ids.add(row.course_id);
  }
  return ids;
}

export const inScope = (scope: Set<string> | null, courseId: string) => scope === null || scope.has(courseId);

export const outOfScope = (message = 'This course is not assigned to you.') => ({ success: false, message });
