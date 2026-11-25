import { kvGet, kvSet } from '@/lib/kv-store';
import { courseIdFromKey, lessonVideoKey, R2_PREFIX } from '@/lib/r2';

// The parts of a course that sit beside its lessons: short videos, relevant questions
// (question and answer written by the course team) and the course discussion.

/** Where in the course an item belongs. Empty values mean "the whole course". */
export type Place = { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string };

export type ShortVideo = Place & {
  id: string;
  courseId: string;
  title: string;
  description: string;
  /** "r2:<key>" for an uploaded file, otherwise a YouTube / Vimeo / external link. */
  url: string;
  createdAt: string;
};

export type CourseQuestion = Place & {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  createdAt: string;
};

export type AuthorRole = 'Student' | 'Mentor' | 'Admin';
export type DiscussionNote = { id: string; authorName: string; authorRole: AuthorRole; text: string; at: string };
export type DiscussionPost = DiscussionNote & { courseId: string; replies: DiscussionNote[] };

const SHORTS_KEY = 'short-videos';
const QUESTIONS_KEY = 'course-questions';
const DISCUSSION_KEY = 'course-discussions';

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const place = (input: Partial<Place>): Place => ({
  moduleId: clean(input.moduleId, 80),
  moduleTitle: clean(input.moduleTitle, 200),
  lessonId: clean(input.lessonId, 80),
  lessonTitle: clean(input.lessonTitle, 200),
});

async function list<T>(key: string): Promise<T[]> {
  const saved = await kvGet<T[]>(key, []);
  return Array.isArray(saved) ? saved : [];
}

// ── Short videos ──
export async function shortVideos(courseId: string) {
  return (await list<ShortVideo>(SHORTS_KEY)).filter((item) => item.courseId === courseId);
}

export async function saveShortVideo(courseId: string, input: Partial<ShortVideo>) {
  const title = clean(input.title, 160);
  const url = clean(input.url, 600);
  if (!title) throw new Error('Give the video a title.');
  if (!url) throw new Error('Upload a video or paste a link.');
  if (!url.startsWith(R2_PREFIX) && !/^https?:\/\//i.test(url)) throw new Error('Paste a full link starting with https://');
  const all = await list<ShortVideo>(SHORTS_KEY);
  const existing = input.id ? all.find((item) => item.id === input.id && item.courseId === courseId) : undefined;
  // An uploaded file may only be one from this course.
  const ownCourse = courseIdFromKey(lessonVideoKey(courseId, 'short', 'video.mp4'));
  if (url.startsWith(R2_PREFIX) && url !== existing?.url && courseIdFromKey(url.slice(R2_PREFIX.length)) !== ownCourse) {
    throw new Error('Upload the video from this course.');
  }
  // Lecture numbers run across all courses: SV-00001, SV-00002, …
  const last = all.reduce((max, item) => Math.max(max, Number(item.id.replace(/\D/g, '')) || 0), 0);
  const video: ShortVideo = {
    id: existing?.id || `SV-${String(last + 1).padStart(5, '0')}`,
    courseId,
    ...place(input),
    title,
    description: clean(input.description, 1000),
    url,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await kvSet(SHORTS_KEY, existing ? all.map((item) => (item.id === video.id ? video : item)) : [...all, video]);
  return video;
}

export async function deleteShortVideo(courseId: string, id: string) {
  await kvSet(SHORTS_KEY, (await list<ShortVideo>(SHORTS_KEY)).filter((item) => !(item.id === id && item.courseId === courseId)));
}

// ── Relevant questions ──
export async function courseQuestions(courseId: string) {
  return (await list<CourseQuestion>(QUESTIONS_KEY)).filter((item) => item.courseId === courseId);
}

export async function saveCourseQuestion(courseId: string, input: Partial<CourseQuestion>) {
  const question = clean(input.question, 600);
  const answer = clean(input.answer, 4000);
  if (!question || !answer) throw new Error('Write both the question and its answer.');
  const all = await list<CourseQuestion>(QUESTIONS_KEY);
  const existing = input.id ? all.find((item) => item.id === input.id && item.courseId === courseId) : undefined;
  const item: CourseQuestion = {
    id: existing?.id || uid('cq'),
    courseId,
    ...place(input),
    question,
    answer,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await kvSet(QUESTIONS_KEY, existing ? all.map((row) => (row.id === item.id ? item : row)) : [...all, item]);
  return item;
}

export async function deleteCourseQuestion(courseId: string, id: string) {
  await kvSet(QUESTIONS_KEY, (await list<CourseQuestion>(QUESTIONS_KEY)).filter((item) => !(item.id === id && item.courseId === courseId)));
}

// ── Discussion ──
export async function discussionPosts(courseId: string) {
  return (await list<DiscussionPost>(DISCUSSION_KEY)).filter((item) => item.courseId === courseId);
}

type Author = { name: string; role: AuthorRole };

function note(author: Author, text: string): DiscussionNote {
  const body = clean(text, 2000);
  if (body.length < 2) throw new Error('Write your message first.');
  return { id: uid('dn'), authorName: clean(author.name, 80) || author.role, authorRole: author.role, text: body, at: new Date().toISOString() };
}

/** A new post, or a reply when postId is given. */
export async function addDiscussionNote(courseId: string, author: Author, text: string, postId = '') {
  const all = await list<DiscussionPost>(DISCUSSION_KEY);
  const added = note(author, text);
  if (!postId) {
    await kvSet(DISCUSSION_KEY, [{ ...added, courseId, replies: [] }, ...all].slice(0, 5000));
    return;
  }
  if (!all.some((item) => item.id === postId && item.courseId === courseId)) throw new Error('That post is no longer here.');
  await kvSet(DISCUSSION_KEY, all.map((item) => (item.id === postId ? { ...item, replies: [...item.replies, added] } : item)));
}

/** Removes a post, or one reply under any post of this course. */
export async function deleteDiscussionNote(courseId: string, id: string) {
  const all = await list<DiscussionPost>(DISCUSSION_KEY);
  await kvSet(DISCUSSION_KEY, all
    .filter((item) => !(item.id === id && item.courseId === courseId))
    .map((item) => (item.courseId === courseId ? { ...item, replies: item.replies.filter((reply) => reply.id !== id) } : item)));
}
