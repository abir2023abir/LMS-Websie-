'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronsRight, Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const reviews = [
  {
    name: '[Verified learner name]',
    role: '[Course or programme]',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    quote: '[Insert a genuine review from a verified learner.]',
    rating: 5,
  },
  {
    name: '[Verified learner name]',
    role: '[Course or programme]',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    quote: '[Insert a genuine review from a verified learner.]',
    rating: 5,
  },
  {
    name: '[Verified learner name]',
    role: '[Course or programme]',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    quote: '[Insert a genuine review from a verified learner.]',
    rating: 5,
  },
];

export default function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section id="reviews" className="bg-[#111827] text-white py-20 relative overflow-hidden border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-[#FACC15] rounded-full px-3.5 py-1">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">LEARNER FEEDBACK</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            What Our Learners Say
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Real experiences from learners who have used our courses and learning resources.
          </p>
        </div>

        {/* Reviews Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {reviews.slice(0, 2).map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-dark-800/80 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-10 h-10 text-[#FACC15]/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-white">
                  A Better Learning Experience
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#FACC15]">
                    <Image
                      src={rev.avatar}
                      alt={rev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{rev.name}</div>
                    <div className="text-[10px] text-slate-400">{rev.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={prevReview}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#111827] text-white flex items-center justify-center transition-all border border-white/10"
            aria-label="Previous review"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {reviews.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-[#FACC15] w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextReview}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#111827] text-white flex items-center justify-center transition-all border border-white/10"
            aria-label="Next review"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
