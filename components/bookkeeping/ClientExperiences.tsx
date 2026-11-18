'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

type Review = { id: string; name: string; role: string; text: string; rating: number | null };

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase();

/**
 * Client layout, section 06: verified client reviews marked "Bookkeeping page" in
 * Admin → Landing Page CMS → Reviews. Hidden until at least one is published.
 */
export default function ClientExperiences() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/landing/reviews?page=bookkeeping', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (active) setReviews(Array.isArray(data?.reviews) ? data.reviews : []); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Client Experiences</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">Our clients&apos; experiences help us understand and improve the quality of our bookkeeping support.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {reviews.slice(0, 4).map((review) => (
            <article key={review.id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-[#f5f7fa] p-6 sm:p-8">
              {review.rating && (
                <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, index) => <Star key={index} aria-hidden="true" className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />)}
                </div>
              )}
              <p className="mt-4 flex-1 text-base leading-relaxed text-slate-700">“{review.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827] font-display text-sm font-extrabold text-[#FACC15]">{initials(review.name)}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#111827]">{review.name}</p>
                  {review.role && <p className="truncate text-xs text-slate-500">{review.role}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
