'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { featuredCourses, categories } from '@/lib/data';
import type { CourseSchema } from '@/types/course';
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Filter,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-low' | 'price-high' | 'newest'>('popular');

  // Checkout modal state
  const [selectedCourse, setSelectedCourse] = useState<CourseSchema | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

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
    return featuredCourses
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

        return matchesSearch && matchesCat && matchesLevel && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popular') return (b.studentCount || 0) - (a.studentCount || 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedLevel, priceFilter, sortBy]);

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
    <div className="min-h-screen bg-[#0d131f] text-white flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full flex-1">
        {/* ── HEADER BANNER ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1F1641] via-[#151b2e] to-[#0d131f] border border-white/10 p-8 sm:p-12 mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] px-3.5 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-[#FACC15]" />
              <span>Explore 1,200+ Premium English & Career Courses</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Unlock Your Potential with World-Class Programs
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              From practical conversation to IELTS mastery and career skills — learn directly from top native and certified instructors at your own pace.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2">
              <div className="flex items-center bg-[#111827]/90 border border-white/15 rounded-2xl p-2 max-w-xl shadow-2xl backdrop-blur-md focus-within:border-[#FACC15] transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, skills, topics (e.g. Conversation, IELTS, Business)..."
                  className="bg-transparent text-sm text-white placeholder-slate-400 px-3 py-2 w-full focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/10 rounded-lg mr-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTERS & CONTROLS BAR ── */}
        <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-4 sm:p-5 mb-8 backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#FACC15]" /> Category:
              </span>
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1F2937] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FACC15]"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Secondary Filters: Level & Price */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-semibold">Level:</span>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedLevel === lvl
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-semibold">Pricing:</span>
              {(['All', 'Paid', 'Free'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    priceFilter === p
                      ? 'bg-[#FACC15] text-[#111827] font-bold'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="text-slate-400">
              Showing <strong className="text-white">{filteredCourses.length}</strong> available courses
            </div>
          </div>
        </div>

        {/* ── COURSE CARDS GRID ── */}
        {filteredCourses.length === 0 ? (
          <div className="bg-[#111827] rounded-3xl border border-white/10 p-12 text-center space-y-4 max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-display font-bold text-xl text-white">No courses match your criteria</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or removing some of your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
                setPriceFilter('All');
              }}
              className="bg-[#FACC15] text-[#111827] font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#eab308] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[#111827] rounded-3xl overflow-hidden border border-white/10 hover:border-[#FACC15]/50 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl group"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/10] bg-[#1a2234] overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                  {/* Category & Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#111827]/90 text-[#FACC15] border border-[#FACC15]/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                      {course.category}
                    </span>
                    {course.isBestseller && (
                      <span className="bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Bestseller
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-black/70 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md">
                    {course.level}
                  </span>
                </div>

                {/* Course Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{course.rating || 4.8}</span>
                        <span className="text-slate-500 font-normal">({(course.reviewCount || 420).toLocaleString()})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {course.lessonCount} lessons
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-[#FACC15] transition-colors line-clamp-2">
                      <Link href={`/courses/${course.id}`}>{course.title}</Link>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Instructor snippet */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-[#FACC15] text-[#111827] font-bold flex items-center justify-center text-[10px]">
                        {course.instructor.name.charAt(0)}
                      </div>
                      <span className="truncate">{course.instructor.name}</span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-extrabold text-2xl text-[#FACC15]">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      {course.originalPrice > course.price && (
                        <span className="text-xs text-slate-500 line-through">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/courses/${course.id}`}
                        className="px-3.5 py-2 rounded-full border border-white/20 hover:border-white/40 text-xs font-bold text-white transition-all"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleEnroll(course)}
                        className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-[#FACC15]/20"
                      >
                        <span>Join</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── CERTIFICATE CALLOUT BANNER ── */}
        <div className="mt-16 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 rounded-3xl border border-purple-500/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FACC15]/30">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Earn Certified Credentials on Completion
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Every course is backed by an authenticated digital certificate with a verifiable QR code to showcase on LinkedIn or your CV.
              </p>
            </div>
          </div>
          <Link
            href="/verify-certificate"
            className="flex-shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-3 rounded-full transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
            <span>Verify Certificate</span>
          </Link>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedCourse && (
        <CheckoutModal
          course={selectedCourse}
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}

      <EnglishFooter />
    </div>
  );
}
