import Link from 'next/link';
import { ArrowRight, Layers, TrendingUp } from 'lucide-react';
import { featuredCourses, categories } from '@/lib/data';
import CourseCard from '@/components/cards/CourseCard';

export default function FeaturedCourses() {
  return (
    <section
      id="featured-courses"
      className="relative py-24 overflow-hidden"
      aria-label="Featured courses"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-dark-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-primary-500 rounded-full" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-400">
                Curated For You
              </p>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-3 leading-tight">
              Featured{' '}
              <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-lg">
              Hand-picked by our experts to help you fast-track your career with in-demand skills.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors duration-150 flex-shrink-0 group"
            id="view-all-courses-btn"
          >
            View all courses
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Category Filter Chips ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white shadow-lg shadow-primary-600/25 transition-all duration-150"
            aria-pressed="true"
          >
            <Layers className="w-3.5 h-3.5" />
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all duration-150"
              aria-pressed="false"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Trending badge ── */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold text-rose-400">Trending this week</span>
        </div>

        {/* ── Course Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="flex flex-col items-center mt-16 gap-4">
          <p className="text-slate-400 text-sm">
            Explore our full catalog of{' '}
            <span className="text-primary-300 font-semibold">1,200+ courses</span>
          </p>
          <Link
            href="/courses"
            id="explore-all-courses-btn"
            className="inline-flex items-center gap-2.5 bg-primary-gradient text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105 transition-all duration-200 text-base"
          >
            Explore All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
