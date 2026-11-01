import { kvGet, kvSet } from '@/lib/kv-store';

// Live classes attached to a lesson. A student's live-class step is done once an
// admin or mentor marks them as attended.
export type LiveClass = {
  id: string;
  courseId: string; courseTitle: string;
  moduleId: string; moduleTitle: string;
  lessonId: string; lessonTitle: string;
  title: string;
  description: string;
  startsAt: string; // ISO
  durationMinutes: number;
  joinUrl: string;
  recordingUrl: string;
  attendees: string[]; // student ids
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const KEY = 'live-classes';
const uid = () => `live-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);

export async function listLiveClasses(): Promise<LiveClass[]> {
  const list = await kvGet<LiveClass[]>(KEY, []);
  return (Array.isArray(list) ? list : []).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function liveClassesForLesson(courseId: string, lessonId: string) {
  return (await listLiveClasses()).filter((item) => item.published && item.courseId === courseId && item.lessonId === lessonId);
}

export async function saveLiveClass(input: Partial<LiveClass>): Promise<LiveClass> {
  if (!input.courseId || !input.moduleId || !input.lessonId) throw new Error('Choose the course, module and lesson for this live class.');
  const title = clean(input.title, 160);
  if (!title) throw new Error('Give the live class a title.');
  const start = new Date(String(input.startsAt || ''));
  if (Number.isNaN(start.getTime())) throw new Error('Choose the date and time of the class.');
  const joinUrl = clean(input.joinUrl, 500);
  if (joinUrl && !/^https:\/\//i.test(joinUrl)) throw new Error('The meeting link must start with https://');
  const recordingUrl = clean(input.recordingUrl, 500);
  const list = await listLiveClasses();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const now = new Date().toISOString();
  const live: LiveClass = {
    id: existing?.id || uid(),
    courseId: String(input.courseId), courseTitle: clean(input.courseTitle, 200),
    moduleId: String(input.moduleId), moduleTitle: clean(input.moduleTitle, 200),
    lessonId: String(input.lessonId), lessonTitle: clean(input.lessonTitle, 200),
    title,
    description: clean(input.description, 2000),
    startsAt: start.toISOString(),
    durationMinutes: Math.min(600, Math.max(10, Math.round(Number(input.durationMinutes) || 60))),
    joinUrl,
    recordingUrl: recordingUrl && /^https:\/\//i.test(recordingUrl) ? recordingUrl : '',
    attendees: existing?.attendees || [],
    published: Boolean(input.published),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  await kvSet(KEY, existing ? list.map((item) => (item.id === live.id ? live : item)) : [...list, live]);
  return live;
}

export async function deleteLiveClass(id: string) {
  await kvSet(KEY, (await listLiveClasses()).filter((item) => item.id !== id));
}

export async function setAttendance(id: string, studentIds: string[]) {
  const list = await listLiveClasses();
  if (!list.some((item) => item.id === id)) throw new Error('Live class not found.');
  const unique = Array.from(new Set(studentIds.map(String)));
  await kvSet(KEY, list.map((item) => (item.id === id ? { ...item, attendees: unique, updatedAt: new Date().toISOString() } : item)));
}
