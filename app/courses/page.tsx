'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { featuredCourses } from '@/lib/data';
import { courseDiscount, courseEdit, hiddenCourseIds } from '@/lib/workspace';
import { takaFromUsd } from '@/lib/utils';
import type { CourseSchema } from '@/types/course';
import {
  Search,
  Star,
  Clock,
  BookOpen,
  Users,
  Filter,
  Sparkles,
  ChevronRight,
  ChevronsRight,
  Award,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CoursesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-low' | 'price-high' | 'newest'>('popular');

  // Checkout modal state
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Honor deep links like /courses?category=Spoken+English from nav/footer
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat) setSelectedCategory(cat);
    setHiddenIds(hiddenCourseIds());
  }, []);

  // All categories list
  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    featuredCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered & Sorted courses
  const filteredCourses = useMemo(() => {
    const catalog = featuredCourses.map((course) => {
      const edit = courseEdit(String(course.id));
      return {
        ...course,
        title: edit.title || course.title,
        price: typeof edit.price === 'number' ? edit.price : course.price,
      };
    });
    return catalog
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
        const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
        const matchesPrice =
          priceFilter === 'All'
            ? true
            : priceFilter === 'Free'
            ? c.price === 0
            : c.price > 0;
        const isVisible = !hiddenIds.includes(String(c.id));

        return matchesSearch && matchesCat && matchesLevel && matchesPrice && isVisible;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popular') return (b.studentCount || 0) - (a.studentCount || 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedLevel, priceFilter, sortBy, hiddenIds]);

  const handleEnroll = (course: any) => {
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      {/* ── HERO BANNER (MATCHING HOMEPAGE HERO GRADIENT) ── */}
      <section className="relative bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Welcome Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 border border-black/20 shadow-md">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">English Capsules Catalog</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.08] tracking-tight">
              Explore Our English Programs & Masterclasses
            </h1>

            <p className="text-base sm:text-lg text-[#111827]/85 font-medium leading-relaxed max-w-2xl">
              Practical, capsule-sized courses designed to help you speak confidently, ace IELTS, and master professional corporate communication.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="pt-2 max-w-xl">
            <div className="flex items-center bg-white border-2 border-black/10 rounded-2xl p-2 shadow-xl focus-within:border-[#111827] transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spoken English, IELTS, grammar, business, idioms..."
                className="bg-transparent text-sm text-[#111827] placeholder-slate-400 px-3 py-2 w-full focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-[#111827] px-2.5 py-1 bg-slate-100 rounded-lg mr-2 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-8">
        {/* ── FILTERS TOOLBAR (CLEAN WHITE CARD) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          {/* Category Filter Pills */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Program Categories</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Controls: Level, Price, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Level Dropdown */}
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <span className="text-slate-500 font-semibold">Level:</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-transparent text-[#111827] focus:outline-none cursor-pointer font-bold"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <span className="text-slate-500 font-semibold">Pricing:</span>
                <div className="flex items-center gap-1">
                  {(['All', 'Paid', 'Free'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriceFilter(p)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                        priceFilter === p ? 'bg-[#FACC15] text-[#111827]' : 'hover:text-[#111827]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#111827] focus:outline-none cursor-pointer font-bold"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Capsules</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── COURSE CARDS GRID ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#111827]">
              Showing <span className="text-amber-600">{filteredCourses.length}</span> English Capsules
            </h2>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Reset Category Filter
              </button>
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#111827]">No English Capsules Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                We could not find any capsules matching your current search or filters. Try adjusting your query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setPriceFilter('All');
                }}
                className="bg-[#FACC15] text-[#111827] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => {
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl group"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category Pill */}
                      <span className="absolute top-3.5 left-3.5 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md shadow">
                        {course.category}
                      </span>

                      {/* Level Badge */}
                      <span className="absolute top-3.5 right-3.5 bg-white/90 text-[#111827] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow">
                        {course.level}
                      </span>

                      {/* Bestseller Badge */}
                      {course.isBestseller && (
                        <span className="absolute bottom-3 left-3.5 bg-[#FACC15] text-[#111827] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Bestseller
                        </span>
                      )}
                    </div>

                    {/* Details Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-2.5">
                        {/* Rating & Students */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-[#111827]">{course.rating}</span>
                            <span className="text-slate-400 font-normal">
                              ({course.reviewCount.toLocaleString()})
                            </span>
                          </div>

                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.studentCount.toLocaleString()} learners</span>
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/courses/${course.id}`}>
                          <h3 className="font-display font-bold text-[#111827] text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                            {course.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {course.description}
                        </p>

                        {/* Instructor */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <div className="w-7 h-7 rounded-full overflow-hidden relative border border-slate-200 flex-shrink-0">
                            <Image
                              src={course.instructor.avatar}
                              alt={course.instructor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs text-slate-700 font-medium truncate">
                            {course.instructor.name}
                          </span>
                        </div>
                      </div>

                      {/* Meta Tags & Duration */}
                      <div className="pt-3 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                            {course.lessonCount} Lectures
                          </span>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            {course.price === 0 ? (
                              <span className="font-display font-extrabold text-2xl text-emerald-600">
                                FREE
                              </span>
                            ) : (
                              <div className="flex items-baseline gap-2">
                                <span className="font-display font-extrabold text-2xl text-[#111827]">
                                  {takaFromUsd(Math.max(0, Math.round(course.price * (100 - courseDiscount(String(course.id))) / 100)))}
                                </span>
                                {(course.originalPrice || courseDiscount(String(course.id)) > 0) && (
                                  <span className="text-xs text-slate-400 line-through">
                                    {takaFromUsd(course.originalPrice || course.price)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/courses/${course.id}`}
                              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                            >
                              Details
                            </Link>

                            <button
                              onClick={() => handleEnroll(course)}
                              className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#eab308] text-[#111827] text-xs font-extrabold transition-all shadow-md shadow-[#FACC15]/20 flex items-center gap-1.5"
                            >
                              <span>Enroll Now</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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
