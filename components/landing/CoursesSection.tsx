'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronsRight, Sparkles, Clock, ChevronRight, CalendarDays, Timer, MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { homepageFeaturedCourses } from '@/lib/data';
import type { CourseSchema } from '@/types/course';
import { takaFromUsd } from '@/lib/utils';

const categoryFilters = ['All Courses', 'Accounting', 'Business', 'Digital Skills'];

type LiveProgramme = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string | null;
  duration?: string | null;
  format?: string | null;
  status?: string | null;
  registration_url?: string | null;
};

export default function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [liveProgrammes, setLiveProgrammes] = useState<LiveProgramme[]>([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/landing/orientation-programmes', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Could not load programmes'))))
      .then((data) => {
        if (active) setLiveProgrammes(Array.isArray(data.programmes) ? data.programmes : []);
      })
      .catch(() => {
        if (active) setLiveProgrammes([]);
      })
      .finally(() => {
        if (active) setProgrammesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = (
    activeCategory === 'All Courses'
      ? homepageFeaturedCourses
      : homepageFeaturedCourses.filter((c) => c.category === activeCategory)
  ).slice(0, 3);

  const handleViewCourse = (course: any) => {
    setSelectedCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      instructorId: course.instructor.name,
      instructorName: course.instructor.name,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessonCount: course.lessonCount,
    });
    setCheckoutOpen(true);
  };

  return (
    <section id="courses" className="space-y-20">
      {/* ── PART A: LIVE PROGRAMMES & ORIENTATION — only shown when a programme is scheduled ── */}
      {liveProgrammes.length > 0 && (
      <div className="bg-white py-16 sm:py-24 text-[#111827]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto space-y-4 max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
              <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-wide">LIVE PROGRAMMES & ORIENTATION</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
              Join a Programme. Discover Your Next Step.
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              Explore live orientation sessions, programme introductions, workshops, and scheduled learning events designed to help you understand your options before choosing your learning path.
            </p>
          </motion.div>

          {/* Publish only programmes that have a real upcoming schedule. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveProgrammes.map((programme, index) => (
              <motion.div
                key={programme.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-[#FEFCE8]/60 border border-[#FEF9C3] hover:border-[#FACC15]/60 hover:shadow-lg hover:shadow-[#FACC15]/10 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-[#111827] leading-tight">
                    {programme.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {programme.description}
                  </p>
                  <div className="pt-3 space-y-2 text-xs text-slate-500">
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[#A16207]" /><span>{new Date(programme.event_date).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })}{programme.event_time ? ` · ${programme.event_time}` : ''}</span></p>
                    {programme.duration && <p className="flex items-center gap-2"><Timer className="h-4 w-4 shrink-0 text-[#A16207]" /><span>{programme.duration}</span></p>}
                    {programme.format && <p className="flex items-center gap-2"><MonitorPlay className="h-4 w-4 shrink-0 text-[#A16207]" /><span>{programme.format}</span></p>}
                    {programme.status && <p><span className="font-semibold">Registration:</span> {programme.status}</p>}
                  </div>
                </div>
                {programme.registration_url && (
                  <div className="pt-4">
                  <a
                    href={programme.registration_url}
                    target={programme.registration_url.startsWith('http') ? '_blank' : undefined}
                    rel={programme.registration_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-bold transition-all shadow-md shadow-[#FACC15]/20"
                  >
                    <span>{programme.status?.toLowerCase().includes('open') ? 'Register Now' : 'View Programme'}</span>
                    <div className="ml-2 w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                    </div>
                  </a>
                  </div>
                )}
              </motion.div>
            ))}
            </div>
        </div>
      </div>
      )}

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
                        <Clock className="w-3.5 h-3.5 text-[#FACC15]" /> {course.duration}
                      </span>
                      <span className="bg-[#FACC15]/20 text-[#FACC15] px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {course.level}
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
                      {takaFromUsd(course.price)}
                    </span>
                    <button
                      onClick={() => handleViewCourse(course)}
                      className="group flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-extrabold transition-all shadow-md shadow-[#FACC15]/20"
                    >
                      <span>View Course</span>
                      <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                      </div>
                    </button>
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

        {/* Checkout Modal */}
        {selectedCourse && (
          <CheckoutModal
            course={selectedCourse}
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
