'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from '../AdminModal';

type Review = {
  id?: string;
  name: string;
  role: string;
  title: string;
  text: string;
  rating: number | null;
  verified: boolean;
  permission: boolean;
  published: boolean;
};

const empty: Review = { name: '', role: '', title: '', text: '', rating: 5, verified: false, permission: false, published: false };

export default function ReviewsEditor() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

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
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
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

  const canPublish = (review: Review) => review.verified && review.permission;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-600">Only reviews you have <strong>verified</strong> and have the learner&apos;s <strong>permission</strong> to show can be published. The home page section stays hidden until at least one is published.</p>
        <button type="button" onClick={() => setDraft({ ...empty })} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add review</button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <Star className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-semibold text-slate-700">No reviews yet</p>
          <p className="text-sm text-slate-500">Add a review once a learner agrees to share their feedback.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{review.name}</p>
                  {review.role && <p className="truncate text-xs text-slate-500">{review.role}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${review.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{review.published ? 'Published' : 'Hidden'}</span>
              </div>
              {review.rating && <div className="flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#FACC15] text-[#FACC15]" />)}</div>}
              {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
              <p className="line-clamp-3 text-sm text-slate-600">“{review.text}”</p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span>{review.verified ? 'Verified' : 'Not verified'} · {review.permission ? 'Permission given' : 'No permission'}</span>
                <span className="flex gap-1">
                  <button type="button" onClick={() => setDraft({ ...review })} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { if (confirm('Delete this review?')) void post({ action: 'delete', id: review.id }, 'Review deleted'); }} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
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
            <label className="block text-xs font-bold text-slate-500">Rating
              <select className={`${fieldClass} mt-1`} value={draft.rating ?? ''} onChange={(e) => setDraft({ ...draft, rating: e.target.value ? Number(e.target.value) : null })}>
                <option value="">No rating</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.verified} onChange={(e) => setDraft({ ...draft, verified: e.target.checked, published: e.target.checked && draft.published })} />I have verified this learner took our course</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.permission} onChange={(e) => setDraft({ ...draft, permission: e.target.checked, published: e.target.checked && draft.published })} />The learner gave permission to publish it</label>
              <label className={`flex items-center gap-2 ${canPublish(draft) ? '' : 'opacity-50'}`}><input type="checkbox" disabled={!canPublish(draft)} checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Show on the home page</label>
            </div>
            <button type="button" disabled={saving} onClick={async () => { if (await post(draft as unknown as Record<string, unknown>, 'Review saved')) setDraft(null); }} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save review'}</button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
