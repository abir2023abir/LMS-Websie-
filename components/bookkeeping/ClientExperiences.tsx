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
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Client Experiences</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[13px] text-slate-600 sm:mt-3 sm:text-base">Our clients&apos; experiences help us understand and improve the quality of our bookkeeping support.</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5">
          {reviews.slice(0, 4).map((review) => (
            <article key={review.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#f5f7fa] p-2.5 sm:rounded-3xl sm:p-8">
              {review.rating && (
                <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: review.rating }).map((_, index) => <Star key={index} aria-hidden="true" className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />)}
                </div>
              )}
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-700 sm:mt-4 sm:text-base">“{review.text}”</p>
              <div className="mt-3 flex items-center gap-2 sm:mt-6 sm:gap-3">
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111827] font-display text-xs sm:h-12 sm:w-12 sm:rounded-xl sm:text-sm font-extrabold text-[#FACC15]">{initials(review.name)}</span>
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
