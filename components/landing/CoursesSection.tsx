'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronsRight, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveProgrammes from './LiveProgrammes';
import { useCatalog } from '@/lib/catalog-client';
import { takaFromUsd } from '@/lib/utils';

const categoryFilters = ['All Courses', 'Accounting', 'Business', 'Digital Skills'];

export default function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const { visible, priceOf, added } = useCatalog();
  // Three cards on the home page: courses added in the panel come first (newest on top), then the built-in ones.
  const isAdded = new Set(added.map((course) => String(course.id)));
  const filtered = [...visible.filter((c) => isAdded.has(String(c.id))), ...visible.filter((c) => !isAdded.has(String(c.id)))]
    .filter((c) => activeCategory === 'All Courses' || c.category === activeCategory)
    .slice(0, 3);

  return (
    <section id="courses" className="space-y-20">
      {/* ── PART A: LIVE PROGRAMMES & ORIENTATION ── */}
      <LiveProgrammes hideWhenEmpty />

      {/* ── PART B: FEATURED COURSES ── */}
      <div className="relative bg-[#111827] text-white py-20 overflow-hidden">
        {/* Top SVG Curve Transition */}
        <div className="absolute top-0 inset-x-0 overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12 text-white" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,80 C960,20 480,80 0,20 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 pt-8">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto relative">
            {/* Spark SVG accents */}
            <Sparkles className="w-6 h-6 text-[#FACC15] absolute -top-4 right-10 fill-[#FACC15]" />
            <Sparkles className="w-4 h-4 text-[#FACC15] absolute top-8 left-6 fill-[#FACC15]" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-[#FACC15] rounded-full px-3.5 py-1">
              <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-wide">EXPLORE OUR COURSES</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Find the Right Course for Your Next Step
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Explore structured learning programmes designed to build knowledge, develop practical skills, and support your learning goals.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categoryFilters.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FACC15] text-[#111827] shadow-lg shadow-[#FACC15]/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && <p className="text-center text-sm text-slate-400">No course is in this category yet.</p>}

          {/* 3-Column Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-[#1a2234] rounded-3xl overflow-hidden border border-white/10 hover:border-[#FACC15]/50 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div className="relative aspect-[16/10] bg-dark-900 overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    unoptimized={!course.thumbnail.startsWith('https://images.unsplash.com/')}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {course.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        {course.duration && (<><Clock className="w-3.5 h-3.5 text-[#FACC15]" /> {course.duration}</>)}
                      </span>
                      {/* The course type set in the panel; "Live" when none is set (client layout: "◷ 20h 00m · Live"). */}
                      <span className="flex items-center gap-1.5 rounded-full bg-[#FACC15]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FACC15]">
                        {(course.type || 'Live') === 'Live' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />} {course.type || 'Live'}
                      </span>
                    </div>

                    <Link href={`/courses/${course.id}`}>
                      <h3 className="font-display font-bold text-base text-white group-hover:text-[#FACC15] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="font-display font-extrabold text-2xl text-[#FACC15]">
                      {priceOf(course) === 0 ? 'Free' : takaFromUsd(priceOf(course))}
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className="group flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-extrabold transition-all shadow-md shadow-[#FACC15]/20"
                    >
                      <span>View Course</span>
                      <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore All CTA */}
          <div className="text-center pt-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-2xl transition-all hover:border-[#FACC15]"
            >
              <span>Explore All Courses</span>
              <ChevronRight className="w-4 h-4 text-[#FACC15]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
