'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { blogPosts, type BlogPost } from '@/lib/blog-data';
import {
  Search,
  BookOpen,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Calendar,
  Tag,
  Filter,
  ChevronRight,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  'All',
  'Speaking & Fluency',
  'IELTS & TOEFL',
  'Kids English',
  'Business English',
  'Grammar Guides',
] as const;

export default function BlogCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const featuredPost = useMemo(() => {
    return blogPosts.find((p) => p.isFeatured) || blogPosts[0];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || post.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      {/* ── BLOG HERO BANNER ── */}
      <section className="relative bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-[#111827]">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-4 py-1.5 border border-black/20 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15] fill-current" />
            <span className="text-xs font-extrabold tracking-wide uppercase">
              English Learning Articles & Guides
            </span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.08] tracking-tight">
              Master English: Tips, Guides & Strategies
            </h1>
            <p className="text-base sm:text-lg text-[#111827]/85 font-medium leading-relaxed max-w-2xl">
              Actionable lessons on spoken fluency, IELTS Band 8+ prep, early phonics for kids, and executive corporate communication.
            </p>
          </div>

          {/* Search Bar */}
          <div className="pt-2 max-w-xl">
            <div className="flex items-center bg-white border-2 border-black/10 rounded-2xl p-2 shadow-xl focus-within:border-[#111827] transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles (e.g. Fluency, IELTS, Phonics, Idioms)..."
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

      {/* ── MAIN BLOG CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-12">
        {/* Category Filters Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Filter by Topic</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/30 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── FEATURED HERO ARTICLE (IF MATCHING OR NO SEARCH) ── */}
        {!searchQuery && selectedCategory === 'All' && featuredPost && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Featured Editor’s Choice
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden shadow-sm hover:shadow-xl transition-all grid grid-cols-1 lg:grid-cols-12 items-center group"
            >
              {/* Cover Image */}
              <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full bg-slate-100 min-h-[300px] overflow-hidden">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <span className="absolute top-4 left-4 bg-[#111827] text-[#FACC15] text-[11px] font-extrabold px-3 py-1 rounded-full shadow">
                  {featuredPost.category}
                </span>
              </div>

              {/* Text Info */}
              <div className="lg:col-span-6 p-6 sm:p-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {featuredPost.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827] group-hover:text-amber-600 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                {/* Author & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200">
                      <Image
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#111827]">{featuredPost.author.name}</div>
                      <div className="text-[10px] text-slate-500">{featuredPost.author.role}</div>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── ARTICLES GRID ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#111827]">
              {selectedCategory === 'All' ? 'Latest Articles & Guides' : `${selectedCategory} Guides`} ({filteredPosts.length})
            </h3>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-lg text-[#111827]">No Articles Found</h4>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                We could not find any articles matching your search query. Try another keyword or reset the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-[#FACC15] text-[#111827] font-extrabold text-xs px-6 py-2.5 rounded-xl shadow"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3.5 left-3.5 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-3 py-1 rounded-full shadow">
                      {post.category}
                    </span>
                    <span className="absolute bottom-3 right-3.5 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      {post.readTime}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h4 className="font-display font-bold text-base sm:text-lg text-[#111827] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer / Author */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden relative border border-slate-200 flex-shrink-0">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-slate-700 font-bold truncate">
                          {post.author.name}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── NEWSLETTER SUBSCRIPTION BANNER ── */}
        <div className="bg-gradient-to-r from-[#111827] via-[#1a2234] to-[#111827] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              <Mail className="w-3.5 h-3.5" /> Free Weekly English Capsule
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Get Weekly English Fluency Drills in Your Inbox
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Join 65,000+ subscribers who receive our 3-minute idiom breakdowns, pronunciation drills, and IELTS sample answers every Tuesday.
            </p>
          </div>

          <div className="relative z-10 max-w-md">
            {subscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>You’re on the list! Check your inbox for your first English Capsule.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#FACC15] font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow-md flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <EnglishFooter />
    </div>
  );
}
