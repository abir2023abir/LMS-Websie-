'use client';

import { useEffect, useState } from 'react';
import { ChevronsRight, Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

type LearnerReview = {
  id: string;
  title: string;
  name: string;
  role: string;
  text: string;
  rating: number | null;
};

// "Md. Arif" -> "MA": first letters of the first two words.
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase();

export default function Testimonials({ page = 'home' }: { page?: 'home' | 'contact' } = {}) {
  const [reviews, setReviews] = useState<LearnerReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(`/api/landing/reviews?page=${page}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Could not load reviews'))))
      .then((data) => {
        if (active) setReviews(Array.isArray(data.reviews) ? data.reviews.filter((review: LearnerReview) => {
          const previewText = `${review.name} ${review.role} ${review.title} ${review.text}`;
          return !/\[sample\]|layout preview sample|sample learner/i.test(previewText);
        }) : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => { active = false; };
  }, [page]);

  const visibleReviews = reviews.length
    ? [0, 1].slice(0, Math.min(2, reviews.length)).map((offset) => reviews[(currentIndex + offset) % reviews.length])
    : [];

  const move = (direction: -1 | 1) => {
    if (reviews.length > 1) setCurrentIndex((index) => (index + direction + reviews.length) % reviews.length);
  };

  // Client rule: a part with no data is not shown; it appears once a verified review is published.
  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="relative overflow-hidden border-t border-white/10 bg-[#111827] py-10 text-white sm:py-20">
      <div className="mx-auto max-w-6xl space-y-5 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[#FACC15]">
            <span className="flex items-center justify-center rounded-full bg-[#FACC15] p-1 text-[#111827]">
              <ChevronsRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold tracking-wide">STUDENT REVIEWS</span>
          </div>

          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Student Reviews
          </h2>
          <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
            শিক্ষার্থীদের অভিজ্ঞতা আমাদের শেখার মান আরও উন্নত করে।
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-2.5 md:grid-cols-2 md:gap-5">
          {visibleReviews.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-800/80 p-4 shadow-lg shadow-black/10 sm:min-h-64 sm:rounded-3xl sm:p-8"
            >
              <Quote aria-hidden="true" className="absolute right-6 top-6 h-10 w-10 text-[#FACC15]/25" />
              <div className="space-y-2 pr-10 sm:space-y-4">
                {review.rating && (
                  <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={starIndex} aria-hidden="true" className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                    ))}
                  </div>
                )}
                {review.title && review.title !== 'A Better Learning Experience' && <h3 className="font-display text-lg font-bold text-white">{review.title}</h3>}
                <p className="text-sm leading-relaxed text-slate-300">“{review.text}”</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-3 sm:mt-7 sm:pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#FACC15]/70 bg-slate-700 text-sm font-bold text-[#FACC15]">
                    {initials(review.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{review.name}</p>
                    {review.role && <p className="mt-0.5 truncate text-xs text-slate-400">{review.role}</p>}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {reviews.length > 1 && (
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
