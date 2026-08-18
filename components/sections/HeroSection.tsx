import Link from 'next/link';
import { ArrowRight, Play, Star, Users, BookOpen, CheckCircle } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';

const trustBadges = [
  { icon: Users,      value: '500K+',  label: 'Students'    },
  { icon: BookOpen,   value: '1,200+', label: 'Courses'     },
  { icon: Star,       value: '4.8/5',  label: 'Avg Rating'  },
];

const highlights = [
  'Learn at your own pace',
  'Expert-led instruction',
  'Lifetime access',
  'Certificate of completion',
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-dark-900"
      aria-label="Hero section"
    >
      {/* ── Background Layers ── */}
      {/* Animated grid */}
      <div className="absolute inset-0 hero-grid opacity-60" />

      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />

      {/* Orbs */}
      <div
        className="orb animate-pulse-slow bg-primary-600"
        style={{ width: 500, height: 500, top: '-100px', left: '-150px' }}
      />
      <div
        className="orb animate-pulse-slow bg-accent-500"
        style={{ width: 400, height: 400, bottom: '-80px', right: '-100px', animationDelay: '2s' }}
      />
      <div
        className="orb animate-pulse-slow bg-primary-800"
        style={{ width: 300, height: 300, top: '40%', right: '20%', animationDelay: '1s' }}
      />

      {/* ── Hero Content ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 glass border border-primary-500/25 rounded-full px-4 py-2 mb-8 animate-fade-up opacity-0 delay-100">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-300">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              New courses added weekly
            </span>
            <span className="h-3.5 w-px bg-white/15" />
            <Link
              href="/courses"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight tracking-tight mb-6 animate-fade-up opacity-0 delay-200">
            Learn From The{' '}
            <span className="relative">
              <span className="gradient-text">Best.</span>
            </span>
            <br />
            Grow Without{' '}
            <span className="relative">
              <span className="gradient-text">Limits.</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-up opacity-0 delay-300">
            Unlock your potential with expert-led courses in tech, design, business, and more.
            Join{' '}
            <span className="text-primary-300 font-semibold">500,000+ learners</span>{' '}
            building the future today.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-up opacity-0 delay-400">
            <SearchBar
              placeholder="Search for courses, topics, or instructors…"
              size="lg"
            />
          </div>

          {/* Quick highlights */}
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-10 animate-fade-up opacity-0 delay-500">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up opacity-0 delay-500">
            <Link href="/signup">
              <Button
                variant="primary"
                size="xl"
                id="hero-signup-btn"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start Learning Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="ghost"
                size="xl"
                id="hero-browse-btn"
                leftIcon={<Play className="w-5 h-5 text-primary-400" />}
              >
                Browse Courses
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 animate-fade-up opacity-0 delay-600">
            {trustBadges.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 glass border border-white/8 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-300" />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-lg text-white leading-none">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent" />
      </div>
    </section>
  );
}
