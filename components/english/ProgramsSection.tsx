'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronsRight, Sparkles, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import type { CourseSchema } from '@/types/course';

const programCategories = ['All', 'Conversation', 'Business English', 'IELTS', 'For children'];

const programCourses: CourseSchema[] = [
  {
    id: 'prog-1',
    title: 'Comprehensive Conversation',
    description: 'A comprehensive program that lets you master the four skills step-by-step from scratch to advanced fluency.',
    price: 49,
    originalPrice: 120,
    instructorId: 'inst-1',
    instructorName: 'English Capsules Team',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=340&fit=crop',
    category: 'Conversation',
    level: 'Beginner',
    duration: '24h 00m',
    lessonCount: 28,
  },
  {
    id: 'prog-2',
    title: 'Business English Masterclass',
    description: 'Master the language of business from beginner to upper-intermediate with hands-on corporate communication practice.',
    price: 59,
    originalPrice: 149,
    instructorId: 'inst-2',
    instructorName: 'Corporate Faculty',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop',
    category: 'Business English',
    level: 'Intermediate',
    duration: '30h 00m',
    lessonCount: 35,
  },
  {
    id: 'prog-3',
    title: 'Spoken Conversation Course',
    description: 'A comprehensive program that makes you fluent, building confidence in real-life English conversation scenarios.',
    price: 39,
    originalPrice: 99,
    instructorId: 'inst-3',
    instructorName: 'Native Instructors',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop',
    category: 'Conversation',
    level: 'Beginner',
    duration: '18h 00m',
    lessonCount: 20,
  },
];

export default function ProgramsSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const filtered = activeCategory === 'All'
    ? programCourses
    : programCourses.filter((c) => c.category === activeCategory);

  const handleJoinNow = (course: CourseSchema) => {
    setSelectedCourse(course);
    setCheckoutOpen(true);
  };

  return (
    <section id="courses" className="relative bg-[#111827] text-white py-20 overflow-hidden">
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
            <span className="text-xs font-bold tracking-wide">Our Programs</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            Programs Designed To Support Your English Learning Journey
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {programCategories.map((cat) => {
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
              className="bg-dark-800/80 rounded-3xl overflow-hidden border border-white/10 hover:border-[#FACC15]/50 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-dark-900">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#FACC15]" /> {course.duration}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-[#FACC15]" /> {course.lessonCount} Lectures</span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-display font-extrabold text-2xl text-[#FACC15]">
                    ${course.price}
                  </span>
                  <Link
                    href={`/checkout/${course.id}`}
                    className="group flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-extrabold transition-all"
                  >
                    <span>Join Now</span>
                    <div className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
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
    </section>
  );
}
