'use client';

import { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

/** Classroom → Reviews: the student rates and reviews the course; an admin approves it before it is shown. */
export default function CourseReviewForm({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [permission, setPermission] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, courseTitle, rating, text, permission }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send the review.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the review.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-display text-lg font-bold text-[#111827]">Thank you for your review</p>
        <p className="mt-1 text-sm text-slate-600">The team reads every review. With your permission, it may appear on the website after it is checked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-[#111827]">Review this course</h3>
        <p className="text-sm text-slate-500">How is {courseTitle} helping you? Your review helps us improve the course.</p>
      </div>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? 's' : ''}`} onClick={() => setRating(value)} className="rounded-lg p-1 hover:bg-slate-100">
            <Star className={`h-7 w-7 ${value <= rating ? 'fill-[#FACC15] text-[#FACC15]' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <textarea aria-label="Your review" name="review" value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={1200} placeholder="What did you learn? What could be better?" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#111827] focus:outline-none" />
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-500" />
        The team may show my name and review on the website after checking it.
      </label>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <button type="button" disabled={busy || text.trim().length < 10} onClick={send} className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send review'}</button>
    </div>
  );
}
