'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, Pencil, Plus, Send, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from '../AdminModal';
import { useCourseOutline } from '../CoursePlacePicker';

type ReviewPage = 'home' | 'course' | 'bookkeeping' | 'contact';
type Review = {
  id?: string;
  name: string;
  role: string;
  title: string;
  text: string;
  rating: number | null;
  page?: ReviewPage;
  pages?: ReviewPage[];
  courseId?: string;
  courseTitle?: string;
  studentEmail?: string;
  liked?: boolean;
  verified: boolean;
  permission: boolean;
  published: boolean;
  createdAt?: string;
};

const PAGES: { id: ReviewPage; label: string }[] = [
  { id: 'home', label: 'Home page' },
  { id: 'course', label: 'Course page' },
  { id: 'bookkeeping', label: 'Bookkeeping page' },
  { id: 'contact', label: 'Contact page' },
];
const pagesOf = (review: Review): ReviewPage[] => (Array.isArray(review.pages) ? review.pages : [review.page || 'home']);
const empty: Review = { name: '', role: '', title: '', text: '', rating: 5, verified: false, permission: false, published: false, pages: ['home'] };
const canPublish = (review: Review) => review.verified && review.permission;
const MONTH = 30 * 86400000;

/** Total, growth over the last 30 days, average rating and how many reviews gave each number of stars. */
function Summary({ reviews }: { reviews: Review[] }) {
  const now = Date.now();
  const age = (review: Review) => now - Date.parse(review.createdAt || '');
  const recent = reviews.filter((review) => age(review) < MONTH).length;
  const before = reviews.filter((review) => age(review) >= MONTH && age(review) < 2 * MONTH).length;
  const growth = before ? Math.round(((recent - before) / before) * 100) : null;
  const rated = reviews.filter((review) => review.rating);
  const average = rated.length ? rated.reduce((sum, review) => sum + (review.rating || 0), 0) / rated.length : 0;
  const tile = 'rounded-2xl border border-slate-200 p-4';
  const label = 'text-[11px] font-extrabold uppercase tracking-wide text-slate-500';
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className={tile}><p className={label}>Total Reviews</p><p className="mt-1 font-display text-3xl font-extrabold">{reviews.length}</p></div>
      <div className={tile}>
        <p className={label}>Growth in 30 days</p>
        <p className={`mt-1 font-display text-3xl font-extrabold ${growth !== null && growth < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{growth === null ? `+${recent}` : `${growth > 0 ? '+' : ''}${growth}%`}</p>
        <p className="text-[11px] text-slate-500">{recent} new, {before} in the 30 days before</p>
      </div>
      <div className={tile}>
        <p className={label}>Average Rating</p>
        <p className="mt-1 flex items-center gap-2 font-display text-3xl font-extrabold">{rated.length ? average.toFixed(1) : '—'}<Star className="h-6 w-6 fill-[#FACC15] text-[#FACC15]" /></p>
        <p className="text-[11px] text-slate-500">{rated.length} rated</p>
      </div>
      <div className={`${tile} space-y-1`}>
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = rated.filter((review) => review.rating === stars).length;
          return (
            <div key={stars} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <span className="w-5 shrink-0">{stars}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[#FACC15]" style={{ width: `${rated.length ? (count / rated.length) * 100 : 0}%` }} /></span>
              <span className="w-6 shrink-0 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Reviews: in the Landing Page CMS (every review) or in a course workspace (`courseId`: that course only). */
export default function ReviewsEditor({ courseId = '' }: { courseId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Review | null>(null);
  const [writing, setWriting] = useState<{ review: Review; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const outline = useCourseOutline(courseId);

  useEffect(() => {
    fetch('/api/admin/cms/reviews', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => toast.error('Could not load reviews'))
      .finally(() => setLoading(false));
  }, []);

  const post = async (body: Record<string, unknown>, success: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Save failed');
      setReviews(data.reviews || []);
      toast.success(success);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const wanted = courseId || (filter === 'all' ? '' : filter);
  const visible = useMemo(() => reviews.filter((review) => !wanted || review.courseId === wanted), [reviews, wanted]);
  const titleOf = (id: string) => outline.find((course) => course.id === id)?.title || '';
  const startNew = () => setDraft({ ...empty, courseId, courseTitle: titleOf(courseId), pages: courseId ? ['course'] : ['home'] });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-600">Only reviews you have <strong>verified</strong> and have the learner&apos;s <strong>permission</strong> to show can be published. A page shows its reviews part only after one is published for it.</p>
        <button type="button" onClick={startNew} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add review</button>
      </div>

      {!courseId && (
        <label className="block max-w-sm text-xs font-bold text-slate-500">Course
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${fieldClass} mt-1`}>
            <option value="all">All reviews</option>
            {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
      )}

      {!loading && <Summary reviews={visible} />}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading reviews…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <Star className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-semibold text-slate-700">No reviews yet</p>
          <p className="text-sm text-slate-500">Reviews students send from the classroom appear here. You can also add one a learner shared with you.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visible.map((review) => (
            <article key={review.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{review.name}</p>
                  {review.role && <p className="truncate text-xs text-slate-500">{review.role}</p>}
                  <p className="truncate text-[11px] font-bold text-[#A16207]">{[review.courseTitle || titleOf(review.courseId || ''), pagesOf(review).map((page) => PAGES.find((item) => item.id === page)?.label).join(', ')].filter(Boolean).join(' · ')}</p>
                </div>
                <button type="button" disabled={saving} onClick={() => post({ action: 'like', id: review.id }, review.liked ? 'Heart removed' : 'Marked with a heart')} aria-pressed={Boolean(review.liked)} aria-label="Heart this review" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-rose-50">
                  <Heart className={`h-5 w-5 ${review.liked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                </button>
              </div>
              {review.rating && <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#FACC15] text-[#FACC15]" />)}</div>}
              {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
              <p className="line-clamp-3 text-sm text-slate-600">“{review.text}”</p>

              <label className={`flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ${canPublish(review) ? 'cursor-pointer' : 'opacity-70'}`}>
                Publish Comment
                <input type="checkbox" role="switch" className="h-4 w-4 accent-emerald-600" checked={review.published} disabled={saving || !canPublish(review)} onChange={(e) => post({ ...review, published: e.target.checked }, e.target.checked ? 'Review published' : 'Review hidden')} />
              </label>
              {!canPublish(review) && <p className="-mt-2 text-[11px] text-slate-500">To publish: open Edit, tick verified and permission.</p>}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span>{review.verified ? 'Verified' : 'Not verified'} · {review.permission ? 'Permission given' : 'No permission'}</span>
                <span className="flex items-center gap-1">
                  {review.studentEmail && <button type="button" onClick={() => setWriting({ review, text: '' })} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 font-bold text-slate-700 hover:bg-slate-100"><Send className="h-3.5 w-3.5" />Direct Message</button>}
                  <button type="button" onClick={() => setDraft({ ...review, pages: pagesOf(review) })} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { if (confirm('Delete this review?')) void post({ action: 'delete', id: review.id }, 'Review deleted'); }} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {writing && (
        <AdminModal title={`Message ${writing.review.name}`} onClose={() => setWriting(null)}>
          <div className="space-y-3">
            <p className="text-sm text-slate-500">The student sees it in their Messages and can reply there. It is not sent by email or SMS.</p>
            <label className="block text-xs font-bold text-slate-500">Message<textarea className={`${fieldClass} mt-1`} rows={4} maxLength={2000} value={writing.text} onChange={(e) => setWriting({ ...writing, text: e.target.value })} /></label>
            <button type="button" disabled={saving || !writing.text.trim()} onClick={async () => { if (await post({ action: 'message', id: writing.review.id, text: writing.text }, 'Message sent')) setWriting(null); }} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Sending…' : 'Send message'}</button>
          </div>
        </AdminModal>
      )}

      {draft && (
        <AdminModal title={draft.id ? 'Edit review' : 'Add review'} onClose={() => setDraft(null)}>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-500">Learner name<input className={`${fieldClass} mt-1`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
              <label className="block text-xs font-bold text-slate-500">Role / course (optional)<input className={`${fieldClass} mt-1`} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g. Bookkeeping learner" /></label>
            </div>
            <label className="block text-xs font-bold text-slate-500">Headline (optional)<input className={`${fieldClass} mt-1`} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="block text-xs font-bold text-slate-500">Review<textarea className={`${fieldClass} mt-1`} rows={4} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} /></label>
            <label className="block text-xs font-bold text-slate-500">Course (optional)
              <select className={`${fieldClass} mt-1`} value={draft.courseId || ''} disabled={Boolean(courseId)} onChange={(e) => setDraft({ ...draft, courseId: e.target.value, courseTitle: titleOf(e.target.value) })}>
                <option value="">Not about one course</option>
                {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            <fieldset className="space-y-2 rounded-xl border border-slate-200 p-3">
              <legend className="px-1 text-xs font-bold text-slate-500">Show on</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAGES.map((page) => (
                  <label key={page.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={pagesOf(draft).includes(page.id)} onChange={(e) => setDraft({ ...draft, pages: e.target.checked ? [...pagesOf(draft), page.id] : pagesOf(draft).filter((item) => item !== page.id) })} />
                    {page.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-xs font-bold text-slate-500">Rating
              <select className={`${fieldClass} mt-1`} value={draft.rating ?? ''} onChange={(e) => setDraft({ ...draft, rating: e.target.value ? Number(e.target.value) : null })}>
                <option value="">No rating</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.verified} onChange={(e) => setDraft({ ...draft, verified: e.target.checked, published: e.target.checked && draft.published })} />I have verified this learner took our course</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.permission} onChange={(e) => setDraft({ ...draft, permission: e.target.checked, published: e.target.checked && draft.published })} />The learner gave permission to publish it</label>
              <label className={`flex items-center gap-2 ${canPublish(draft) ? '' : 'opacity-50'}`}><input type="checkbox" disabled={!canPublish(draft)} checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Publish Comment</label>
            </div>
            <button type="button" disabled={saving} onClick={async () => { if (await post(draft as unknown as Record<string, unknown>, 'Review saved')) setDraft(null); }} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save review'}</button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
