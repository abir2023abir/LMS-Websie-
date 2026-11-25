import { kvGet, kvSet } from '@/lib/kv-store';

// Learner reviews shown in the home page "What Our Learners Say" section.
// Only reviews marked verified with the learner's permission are published.
export type LearnerReview = {
  id: string;
  name: string;
  role: string;
  title: string;
  text: string;
  rating: number | null;
  verified: boolean;
  permission: boolean;
  published: boolean;
  /** The first page it is shown on (older reviews have only this). */
  page: ReviewPage;
  /** Every place it is shown: home ("Student Reviews"), the course page, bookkeeping ("Client Experiences"), contact. */
  pages?: ReviewPage[];
  /** Set when it is about one course; student reviews sent from the classroom always have it. */
  courseId?: string;
  courseTitle?: string;
  /** Who sent it from the classroom, for "Direct Message". Never part of a public response. */
  studentEmail?: string;
  /** The team's heart on the review. */
  liked?: boolean;
  createdAt: string;
};

const KEY = 'cms-reviews';

export const REVIEW_PAGES = ['home', 'course', 'bookkeeping', 'contact'] as const;
export type ReviewPage = (typeof REVIEW_PAGES)[number];

export const pagesOf = (review: Partial<LearnerReview>): ReviewPage[] => (Array.isArray(review.pages) ? review.pages : [review.page || 'home']);

export async function listReviews(): Promise<LearnerReview[]> {
  const list = await kvGet<LearnerReview[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Reviews visitors may see on one page; the course page also needs the course. */
export async function publishedReviews(page: ReviewPage = 'home', courseId = '') {
  return (await listReviews()).filter((review) => review.published && review.verified && review.permission
    && pagesOf(review).includes(page)
    && (page !== 'course' || review.courseId === courseId));
}

export async function saveReview(input: Partial<LearnerReview>): Promise<LearnerReview> {
  const name = String(input.name || '').trim();
  const text = String(input.text || '').trim();
  if (!name || !text) throw new Error('Name and review text are required.');
  const list = await listReviews();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const rating = Number(input.rating);
  const wanted: string[] = Array.isArray(input.pages) ? input.pages : input.page ? [input.page] : existing ? pagesOf(existing) : ['home'];
  const pages = REVIEW_PAGES.filter((page) => wanted.includes(page));
  const courseId = String(input.courseId ?? existing?.courseId ?? '').trim().slice(0, 80);
  if (pages.includes('course') && !courseId) throw new Error('Choose the course for a review shown on a course page.');
  const review: LearnerReview = {
    id: existing?.id || `review-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.slice(0, 80),
    role: String(input.role || '').trim().slice(0, 80),
    title: String(input.title || '').trim().slice(0, 120),
    text: text.slice(0, 1200),
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
    verified: Boolean(input.verified),
    permission: Boolean(input.permission),
    published: Boolean(input.published) && Boolean(input.verified) && Boolean(input.permission),
    page: pages[0] || 'home',
    pages,
    courseId,
    courseTitle: String(input.courseTitle ?? existing?.courseTitle ?? '').trim().slice(0, 200),
    studentEmail: String(input.studentEmail ?? existing?.studentEmail ?? '').trim().slice(0, 200),
    liked: Boolean(input.liked ?? existing?.liked),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await kvSet(KEY, existing ? list.map((item) => (item.id === review.id ? review : item)) : [review, ...list]);
  return review;
}

export async function deleteReview(id: string) {
  await kvSet(KEY, (await listReviews()).filter((item) => item.id !== id));
}
