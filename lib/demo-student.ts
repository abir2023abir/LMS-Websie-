import crypto from 'crypto';
import { createProfile, profileByEmail, profileById, updateProfile, type Profile } from '@/lib/accounts';
import { getAllCourses } from '@/lib/db';
import { DEMO_EMAIL, DEMO_EMAIL_DOMAIN } from '@/lib/demo-shared';

/**
 * The admin's demo student (see lib/demo-shared.ts). It has no usable password, so it opens only
 * through the admin panel's "View as Demo Student" button. It counts as enrolled in every course,
 * without a payment and without being added to any roster, so student counts stay real.
 */
export async function demoStudent(): Promise<Profile> {
  const existing = await profileByEmail(DEMO_EMAIL);
  if (existing && !existing.disabled) return existing;
  if (existing) await resetDemoStudent();
  const created = await createProfile({ email: DEMO_EMAIL, name: 'Demo Student', password: crypto.randomBytes(32).toString('hex'), role: 'Student' }, { demo: true });
  // A random password nobody knows, replaced by a value no password can ever match.
  await updateProfile(created.id, { password_hash: 'locked' });
  return { ...created, password_hash: 'locked' };
}

export async function isDemoStudentId(id: string) {
  if (!id) return false;
  const profile = await profileById(id);
  return Boolean(profile && !profile.disabled && profile.email === DEMO_EMAIL);
}

/** Every course id, for the demo student's enrollments. */
export async function allCourseIds() {
  return (await getAllCourses()).map((course) => String(course.id));
}

/**
 * Start the demo over: the current demo account is set aside (disabled, renamed) and the next
 * "View as Demo Student" makes a fresh one, so progress, quiz answers and the timeline start at Day 1.
 */
export async function resetDemoStudent() {
  const existing = await profileByEmail(DEMO_EMAIL);
  if (!existing) return;
  await updateProfile(existing.id, { disabled: true, email: `demo-old-${Date.now()}${DEMO_EMAIL_DOMAIN}` });
}
