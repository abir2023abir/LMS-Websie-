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
  createdAt: string;
};

const KEY = 'cms-reviews';

export async function listReviews(): Promise<LearnerReview[]> {
  const list = await kvGet<LearnerReview[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function publishedReviews() {
  return (await listReviews()).filter((review) => review.published && review.verified && review.permission);
}

export async function saveReview(input: Partial<LearnerReview>): Promise<LearnerReview> {
  const name = String(input.name || '').trim();
  const text = String(input.text || '').trim();
  if (!name || !text) throw new Error('Name and review text are required.');
  const list = await listReviews();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const rating = Number(input.rating);
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
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  await kvSet(KEY, existing ? list.map((item) => (item.id === review.id ? review : item)) : [review, ...list]);
  return review;
}

export async function deleteReview(id: string) {
  await kvSet(KEY, (await listReviews()).filter((item) => item.id !== id));
}
