'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import type { CourseSchema } from '@/types/course';

const englishCapsulesCourses: CourseSchema[] = [
  {
    id: 'eng-1',
    title: 'General English Foundation Capsule',
    description: 'Master practical English grammar, 1,000+ core vocabulary words, and daily conversation without tedious memorization.',
    price: 39,
    originalPrice: 99,
    instructorId: 'inst-1',
    instructorName: 'Sarah Jenkins',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop',
    category: 'General English',
    level: 'Beginner',
    duration: '18h 30m',
    lessonCount: 24,
    rating: 4.9,
    reviewCount: 3420,
  },
  {
    id: 'eng-2',
    title: 'Spoken English & Accent Perfection',
    description: 'Speak fluently and confidently with native-like pronunciation, stress patterns, and real-life situational practice.',
    price: 49,
    originalPrice: 120,
    instructorId: 'inst-2',
    instructorName: 'David Miller',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=340&fit=crop',
    category: 'Spoken English',
    level: 'Intermediate',
    duration: '22h 00m',
    lessonCount: 30,
    rating: 4.8,
    reviewCount: 2850,
  },
  {
    id: 'eng-3',
    title: 'Business English & Corporate Communication',
    description: 'Elevate your professional career. Master email writing, presentation delivery, negotiations, and interview skills.',
    price: 59,
    originalPrice: 149,
    instructorId: 'inst-3',
    instructorName: 'Emma Watson',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=340&fit=crop',
    category: 'Business English',
    level: 'Advanced',
    duration: '26h 45m',
    lessonCount: 36,
    rating: 4.9,
    reviewCount: 4120,
  },
  {
    id: 'eng-[#eng-4]',
    title: 'IELTS Academic & General Band 8+ Masterclass',
    description: 'Comprehensive preparation for Reading, Listening, Writing, and Speaking modules with Band 8+ strategies.',
    price: 69,
    originalPrice: 179,
    instructorId: 'inst-4',
    instructorName: 'Michael Brown',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop',
    category: 'IELTS Prep',
    level: 'Intermediate',
    duration: '35h 15m',
    lessonCount: 45,
    rating: 4.95,
    reviewCount: 5690,
  },
];

export default function EnglishCoursesSection() {
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleEnrollClick = (course: CourseSchema) => {
    setSelectedCourse(course);
    setIsCheckoutOpen(true);
  };

  return (
    <section id="courses" className="bg-[#FEFCE8]/40 py-20 border-t border-b border-[#FEF9C3] text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-[#FACC15] text-[#111827] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Popular Programs
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
            Explore Our Special English Capsules
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Short, goal-oriented courses tailored for fast results and real-world confidence.
          </p>
        </div>

        {/* 4-Card Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {englishCapsulesCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden border border-[#FEF9C3] hover:border-[#FACC15] shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#111827] text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                  {course.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base text-[#111827] leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {course.lessonCount}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-extrabold text-2xl text-[#111827]">
                      ${course.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ${course.originalPrice}
                    </span>
                  </div>

                  <Link
                    href={`/checkout/${course.id}`}
                    className="flex items-center gap-1 bg-[#111827] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-md"
                  >
                    <span>Enroll</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checkout Modal Integration */}
      {selectedCourse && (
        <CheckoutModal
          course={selectedCourse}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </section>
  );
}
