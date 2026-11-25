'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

type Review = { id: string; title: string; name: string; role: string; text: string; rating: number | null };

function Stars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" className={`h-4 w-4 ${star <= Math.round(value) ? 'fill-[#FACC15] text-[#FACC15]' : 'text-slate-300'}`} />)}
    </span>
  );
}

/** The published reviews of one course. */
export default function CourseReviews({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/landing/reviews?page=course&courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => { if (active) { setReviews(data.reviews || []); setFailed(false); } })
      .catch(() => { if (active) { setReviews([]); setFailed(true); } });
    return () => { active = false; };
  }, [courseId]);

  if (!reviews) return <p className="py-8 text-center text-sm text-slate-500">Loading reviews…</p>;
  if (failed) return <p role="alert" className="py-8 text-center text-sm text-slate-600">Could not load reviews. Refresh the page to try again.</p>;
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <Star className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        No reviews for this course yet.
      </div>
    );
  }
  const rated = reviews.filter((review) => review.rating);
  const average = rated.length ? rated.reduce((sum, review) => sum + Number(review.rating), 0) / rated.length : 0;

  return (
    <div className="space-y-4">
      {average > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <span className="font-display text-3xl font-extrabold text-[#111827]">{average.toFixed(1)}</span>
          <Stars value={average} />
          <span className="text-xs font-semibold text-slate-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
        </div>
      )}
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="space-y-2 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-[#111827]">{review.name}{review.role && <span className="ml-2 text-xs font-normal text-slate-500">{review.role}</span>}</p>
              {review.rating ? <Stars value={review.rating} /> : null}
            </div>
            <p className="text-sm font-semibold text-slate-800">{review.title}</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{review.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
