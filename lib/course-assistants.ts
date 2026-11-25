import { kvGet, kvSet } from '@/lib/kv-store';

// The "Mentor Assistant" of a course (course Settings in the panel): a second instructor who
// helps the mentor on that course. Kept as course id → email.
const KEY = 'course-assistants';

export async function courseAssistants(): Promise<Record<string, string>> {
  const saved = await kvGet<Record<string, string>>(KEY, {});
  return saved && typeof saved === 'object' ? saved : {};
}

export async function assistantFor(courseId: string) {
  return (await courseAssistants())[courseId] || '';
}

/** Ids of the courses this person assists on. */
export async function coursesAssistedBy(email: string) {
  const owner = email.trim().toLowerCase();
  return Object.entries(await courseAssistants()).filter(([, value]) => value.toLowerCase() === owner).map(([courseId]) => courseId);
}

/** An empty email removes the assistant. */
export async function saveCourseAssistant(courseId: string, email: string) {
  const all = await courseAssistants();
  if (email) all[courseId] = email.trim().toLowerCase();
  else delete all[courseId];
  await kvSet(KEY, all);
}
