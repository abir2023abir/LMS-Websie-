'use client';

import { useEffect, useState } from 'react';
import { ChevronsRight, Star, ArrowLeft, ArrowRight, Quote, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

type LearnerReview = {
  id: string;
  title: string;
  name: string;
  role: string;
  text: string;
  rating: number | null;
};

export default function Testimonials() {
  const [reviews, setReviews] = useState<LearnerReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/landing/reviews', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Could not load reviews'))))
      .then((data) => {
        if (active) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleReviews = reviews.length
    ? [0, 1].slice(0, Math.min(2, reviews.length)).map((offset) => reviews[(currentIndex + offset) % reviews.length])
    : [];

  const move = (direction: -1 | 1) => {
    if (reviews.length > 1) setCurrentIndex((index) => (index + direction + reviews.length) % reviews.length);
  };

  // Hide the whole section until at least one verified review is published.
  if (loading || reviews.length === 0) return null;

  return (
    <section id="testimonials" className="relative overflow-hidden border-t border-white/10 bg-[#111827] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl space-y-9 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[#FACC15]">
            <span className="flex items-center justify-center rounded-full bg-[#FACC15] p-1 text-[#111827]">
              <ChevronsRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wide">LEARNER FEEDBACK</span>
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            What Our Learners Say
          </h2>
          <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
            Real experiences from learners who have used our courses and learning resources.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2" aria-label="Loading learner feedback">
            {[0, 1].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5" />)}
          </div>
        ) : visibleReviews.length ? (
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
            {visibleReviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="relative flex min-h-64 flex-col justify-between rounded-3xl border border-white/10 bg-slate-800/80 p-6 shadow-lg shadow-black/10 sm:p-8"
              >
                <Quote aria-hidden="true" className="absolute right-6 top-6 h-10 w-10 text-[#FACC15]/25" />
                <div className="space-y-4 pr-10">
                  <h3 className="font-display text-lg font-bold text-white">{review.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">“{review.text}”</p>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FACC15]/70 bg-slate-700 font-bold text-[#FACC15]">
                      {review.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{review.name}</p>
                      {review.role && <p className="mt-0.5 truncate text-xs text-slate-400">{review.role}</p>}
                    </div>
                  </div>
                  {review.rating && (
                    <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: review.rating }).map((_, starIndex) => (
                        <Star key={starIndex} aria-hidden="true" className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-slate-800/50 px-6 py-10 text-center sm:py-12">
            <ShieldCheck aria-hidden="true" className="mx-auto h-9 w-9 text-[#FACC15]" />
            <h3 className="mt-4 font-display text-lg font-bold text-white">Learner feedback is being gathered</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
              Reviews will appear here after the learner’s feedback is verified and permission to publish is confirmed.
            </p>
          </div>
        )}

        {!loading && reviews.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => move(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-[#FACC15] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
              aria-label="Previous learner review"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5" role="group" aria-label="Choose learner review">
              {reviews.map((review, index) => (
                <button
                  key={review.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] ${index === currentIndex ? 'w-6 bg-[#FACC15]' : 'w-2.5 bg-white/25 hover:bg-white/50'}`}
                  aria-label={`Show learner review ${index + 1}`}
                  aria-current={index === currentIndex}
                />
              ))}
            </div>
            <button
              onClick={() => move(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-[#FACC15] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
              aria-label="Next learner review"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="pt-1 text-center text-xs italic text-slate-400">
          Only genuine, verified reviews with permission to publish are shown.
        </p>
      </div>
    </section>
  );
}
