'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronsRight,
  Heart,
  Music,
  Smile,
  Award,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { takaFromUsd } from '@/lib/utils';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import type { CourseSchema } from '@/types/course';

interface KidsCourse {
  id: string;
  title: string;
  ageGroup: 'Ages 4-6' | 'Ages 7-9' | 'Ages 10-13';
  description: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  duration: string;
  lessonCount: number;
  instructorName: string;
  colorTheme: string;
  badgeText: string;
}

const kidsCourses: KidsCourse[] = [
  {
    id: 'kids-1',
    title: 'Phonics Safari: Alphabet Magic & Sound Explorers',
    ageGroup: 'Ages 4-6',
    description:
      'A colorful musical adventure where little learners master letter sounds, phonics blending, and 200+ fun picture words through catchy songs.',
    thumbnail:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop&auto=format',
    price: 29,
    originalPrice: 69,
    rating: 4.98,
    reviewCount: 4200,
    duration: '14h 20m',
    lessonCount: 24,
    instructorName: 'Emily Clarke (Early Phonics Specialist)',
    colorTheme: 'from-amber-400 to-orange-500',
    badgeText: '🎈 Little Explorers',
  },
  {
    id: 'kids-2',
    title: 'Storybook English: Interactive Reading & Daily Dialogues',
    ageGroup: 'Ages 7-9',
    description:
      'Engaging animated stories that build complete sentence structures, natural speaking confidence, and everyday situational conversation habits.',
    thumbnail:
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop&auto=format',
    price: 35,
    originalPrice: 79,
    rating: 4.95,
    reviewCount: 3800,
    duration: '18h 00m',
    lessonCount: 28,
    instructorName: 'David Miller & Teacher Chloe',
    colorTheme: 'from-cyan-400 to-blue-600',
    badgeText: '📚 Junior Speakers',
  },
  {
    id: 'kids-3',
    title: 'Young Masters: Confident Presentations & Creative English',
    ageGroup: 'Ages 10-13',
    description:
      'Prepare pre-teens for global academic excellence with presentation skills, creative storytelling, vocabulary expansion, and accent refinement.',
    thumbnail:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop&auto=format',
    price: 39,
    originalPrice: 89,
    rating: 4.96,
    reviewCount: 3100,
    duration: '22h 30m',
    lessonCount: 32,
    instructorName: 'Jonathan Hayes (Youth Speech Mentor)',
    colorTheme: 'from-emerald-400 to-teal-600',
    badgeText: '🚀 Young Champions',
  },
];

const ageBrackets = ['All Ages', 'Ages 4-6', 'Ages 7-9', 'Ages 10-13'] as const;

export default function KidsSection() {
  const [selectedAge, setSelectedAge] = useState<string>('All Ages');
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredCourses =
    selectedAge === 'All Ages'
      ? kidsCourses
      : kidsCourses.filter((c) => c.ageGroup === selectedAge);

  const handleEnroll = (course: KidsCourse) => {
    setSelectedCourse({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      instructorId: course.instructorName,
      instructorName: course.instructorName,
      category: 'Kids English',
      level: 'Beginner',
      duration: course.duration,
      lessonCount: course.lessonCount,
    });
    setShowCheckout(true);
  };

  return (
    <section id="kids-english" className="relative bg-[#FEFCE8] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-y border-amber-200/60">
      {/* Decorative Whimsical Background Bubbles */}
      <div className="absolute top-10 left-5 w-48 h-48 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* ── SECTION HEADER ── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Playful Kids Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FACC15] text-[#111827] rounded-full px-4 py-1.5 border border-amber-300 shadow-md font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>English Capsules For Kids & Young Learners</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[#111827] tracking-tight leading-tight">
            Fun, Gamified English Learning For Your Child 🧸✨
          </h2>

          <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
            Build natural pronunciation, early reading habits, and joyful speaking confidence with our certified native children educators.
          </p>

          {/* Age Group Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {ageBrackets.map((age) => (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
                  selectedAge === age
                    ? 'bg-[#111827] text-[#FACC15] shadow-lg shadow-black/15 scale-105'
                    : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3-COLUMN KIDS COURSES GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl border-2 border-amber-200 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] bg-amber-50 overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Age Badge */}
                <span className="absolute top-3.5 left-3.5 bg-[#111827] text-[#FACC15] text-[11px] font-extrabold px-3 py-1 rounded-full shadow">
                  {course.badgeText}
                </span>

                {/* Star rating */}
                <span className="absolute top-3.5 right-3.5 bg-white/95 text-[#111827] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{course.rating}</span>
                </span>
              </div>

              {/* Course Info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {course.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      {course.lessonCount} Video Drills
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-[#111827] group-hover:text-amber-600 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {course.description}
                  </p>

                  <div className="text-[11px] text-slate-500 font-semibold pt-1">
                    Teacher: <span className="text-[#111827] font-bold">{course.instructorName}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Child Enrollment</div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-2xl text-[#111827]">
                        {takaFromUsd(course.price)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        {takaFromUsd(course.originalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnroll(course)}
                    className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#FACC15]/25 flex items-center gap-1.5"
                  >
                    <span>Enroll Child</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── 4-STEP KIDS LEARNING PATHWAY ── */}
        <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#111827]">
              How Your Child Masters English With Us
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              A scientifically structured 4-step progressive framework designed for young minds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {[
              {
                step: '01',
                title: 'Listen & Sing',
                icon: Music,
                desc: 'Catchy phonics rhymes & audio stories develop natural rhythm and listening comprehension.',
                color: 'bg-amber-100 text-amber-800',
              },
              {
                step: '02',
                title: 'Phonics Magic',
                icon: Sparkles,
                desc: 'Letter-sound connections that teach kids how to decode new words effortlessly.',
                color: 'bg-cyan-100 text-cyan-800',
              },
              {
                step: '03',
                title: 'Story Adventures',
                icon: BookOpen,
                desc: 'Animated picture books that encourage sentence building and expand vocabulary.',
                color: 'bg-purple-100 text-purple-800',
              },
              {
                step: '04',
                title: 'Confident Speech',
                icon: Smile,
                desc: 'Interactive speaking prompts and games that get kids expressing ideas proudly in English.',
                color: 'bg-emerald-100 text-emerald-800',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center font-bold`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-black text-slate-300">{item.step}</span>
                </div>
                <h4 className="font-display font-bold text-base text-[#111827]">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedCourse && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          course={selectedCourse}
        />
      )}
    </section>
  );
}
