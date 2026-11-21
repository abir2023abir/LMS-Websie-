'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { featuredCourses, type Course } from '@/lib/data';
import { applyCourseEdit, useCourseEdits } from '@/lib/course-edits-client';
import { useAuth } from '@/context/AuthContext';
import { takaFromUsd } from '@/lib/utils';
import type { CourseSchema } from '@/types/course';
import { ArrowRight, BookOpen, ChevronsRight, Clock } from 'lucide-react';
import LiveProgrammes from '@/components/landing/LiveProgrammes';
import { motion } from 'framer-motion';

type StoredCourse = {
  id: string; title: string; description?: string; price?: number; originalPrice?: number; thumbnail?: string;
  category?: string; duration?: string; instructorName?: string; studentCount?: number; createdAt?: string;
  modules?: { lessons?: unknown[] }[];
};

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop';

/** A course made in the admin or instructor panel, shaped like the built-in catalog entries. */
function toCatalogCourse(course: StoredCourse): Course {
  const lessons = (course.modules || []).reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  return {
    id: String(course.id),
    slug: String(course.id),
    title: course.title || 'Course',
    description: course.description || '',
    instructor: { name: course.instructorName || 'Career Bridge Team', avatar: '', title: '' },
    thumbnail: course.thumbnail || FALLBACK_THUMB,
    category: course.category || 'Accounting',
    categoryColor: '',
    price: Number(course.price) || 0,
    originalPrice: Number(course.originalPrice) || 0,
    rating: 0,
    reviewCount: 0,
    studentCount: Number(course.studentCount) || 0,
    duration: course.duration || '',
    lessonCount: lessons,
    level: 'Beginner',
    tags: [],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
  };
}

// Client layout (Learning Programmes & Courses, Part B): four open category buttons, nothing else.
const ALL = 'All Courses';
const BASE_CATEGORIES = ['Accounting', 'Business', 'Digital Skills'];

export default function CoursesCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState(ALL);

  // Checkout modal state
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Honor deep links like /courses?category=Accounting from nav/footer
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const courseEdits = useCourseEdits();
  // Courses made in the admin / instructor panel (the built-in three are already in featuredCourses).
  const [storedCourses, setStoredCourses] = useState<Course[]>([]);
  useEffect(() => {
    fetch('/api/courses', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const builtIn = new Set(featuredCourses.map((course) => String(course.id)));
        const list = (Array.isArray(data?.courses) ? data.courses : []) as StoredCourse[];
        setStoredCourses(list.filter((course) => course.id && !builtIn.has(String(course.id))).map(toCatalogCourse));
      })
      .catch(() => setStoredCourses([]));
  }, []);
  const allCourses = useMemo(() => [...featuredCourses, ...storedCourses], [storedCourses]);
  const { user, role } = useAuth();

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat) setSelectedCategory(cat);
    fetch('/api/courses/settings')
      .then((res) => res.json())
      .then((data) => {
        const rows = Object.values(data.settings || {}) as { course_id: string; visibility: string; discount: number }[];
        setHiddenIds(rows.filter((row) => row.visibility !== 'published').map((row) => row.course_id));
        setDiscounts(Object.fromEntries(rows.map((row) => [row.course_id, row.discount || 0])));
      })
      .catch(() => undefined);
  }, []);
  const courseDiscount = (id: string) => discounts[id] || 0;

  // All categories list
  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    BASE_CATEGORIES.forEach((name) => set.delete(name));
    return [ALL, ...BASE_CATEGORIES, ...Array.from(set)];
  }, [allCourses]);

  // Filtered & Sorted courses
  const filteredCourses = useMemo(() => {
    const catalog = allCourses.map((course) => applyCourseEdit(course, courseEdits[String(course.id)]));
    return catalog
      .filter((c) => {
        const matchesCat = selectedCategory === ALL || c.category === selectedCategory;
        const isVisible = !hiddenIds.includes(String(c.id));

        return matchesCat && isVisible;
      });
  }, [selectedCategory, hiddenIds, courseEdits, allCourses]);

  const handleEnroll = useCallback((course: any) => {
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
    setShowCheckout(true);
  }, []);

  useEffect(() => {
    if (!user || role !== 'Student') return;
    const courseId = new URLSearchParams(window.location.search).get('enroll');
    if (!courseId) return;
    const course = allCourses.find((item) => String(item.id) === courseId);
    if (!course) return;
    handleEnroll(applyCourseEdit(course, courseEdits[courseId]));
    window.history.replaceState(null, '', '/courses');
  }, [user, role, courseEdits, handleEnroll, allCourses]);

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      {/* ── PART A: LIVE PROGRAMMES & ORIENTATION (client layout) ── */}
      <div className="pt-20">
        <LiveProgrammes />
      </div>

      {/* ── PART B: FEATURED COURSES (client layout: "» EXPLORE OUR COURSES") ── */}
      <section className="relative bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-14 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-5 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 border border-black/20 shadow-md">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">EXPLORE OUR COURSES</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#111827] leading-[1.1] tracking-tight">
            Find the Right Course for Your Next Step
          </h1>
          <p className="text-sm sm:text-base text-[#111827]/80 font-medium leading-relaxed max-w-2xl mx-auto">
            Explore structured learning programmes designed to build knowledge, develop practical skills, and support your learning goals.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-10">
        {/* Category buttons, shown openly (no panel around them) */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Course categories">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#111827] text-[#FACC15] shadow-lg'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#111827]">No Courses Found</h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">No course is in this category yet.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory(ALL)}
              className="bg-[#FACC15] text-[#111827] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow"
            >
              Show All Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => {
              const discount = courseDiscount(String(course.id));
              const price = Math.max(0, Math.round(course.price * (100 - discount) / 100));
              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden flex flex-col transition-all duration-300 shadow-sm hover:shadow-xl group"
                >
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      unoptimized={!course.thumbnail.startsWith('https://images.unsplash.com/')}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3.5 left-3.5 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full backdrop-blur-md shadow">
                      {course.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        {course.duration && (<><Clock className="w-3.5 h-3.5 text-amber-500" />{course.duration}</>)}
                      </span>
                      {/* Every course runs with live classes (client layout: "20h 00m · Live"). */}
                      <span className="flex items-center gap-1.5 rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#A16207]">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" /> Live
                      </span>
                    </div>

                    <Link href={`/courses/${course.id}`}>
                      <h3 className="font-display font-bold text-[#111827] text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{course.description}</p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      {price === 0 ? (
                        <span className="font-display font-extrabold text-2xl text-emerald-600">Free</span>
                      ) : (
                        <span className="font-display font-extrabold text-2xl text-[#111827]">{takaFromUsd(price)}</span>
                      )}
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-extrabold transition-all shadow-md shadow-[#FACC15]/20"
                      >
                        <span>View Course</span>
                        <span className="w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* ── ENROLLMENT / CHECKOUT MODAL ── */}
      {selectedCourse && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          course={selectedCourse}
        />
      )}

      <EnglishFooter />
    </div>
  );
}
