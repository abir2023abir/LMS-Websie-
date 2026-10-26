'use client';

import { motion } from 'framer-motion';
import { ChevronsRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const articles = [
  {
    category: 'AI & Technology',
    title: 'Understanding AI Tools for Learning and Professional Work',
    description: 'Explore how AI tools can support research, learning, productivity, and professional workflows.',
    cta: 'Read Article',
  },
  {
    category: 'Digital Platforms',
    title: 'Digital Skills and Online Platform Updates',
    description: 'Learn about changes in digital tools, online platforms, and technologies that may affect how you study and work.',
    cta: 'Read Article',
  },
  {
    category: 'Career Guide',
    title: 'From Learning to Career: How to Build Your Learning Roadmap',
    description: 'Discover how structured learning, regular practice, and progress tracking can help you work toward your career goals.',
    cta: 'Read Article',
  },
];

export default function LatestFromLMSSection() {
  return (
    <section className="bg-white py-16 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-4xl text-center"
        >
          {/* Latest from LMS Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">LATEST FROM CAREER BRIDGE.STUDIO</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            Latest from Career Bridge.Studio
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Explore the latest insights, practical guides, and updates on learning, technology, accounting, and career development.
          </p>
        </motion.div>

        {/* ── 3-Column Articles Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-[#FEFCE8]/60 border border-[#FEF9C3] hover:border-[#FACC15]/40 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="text-xs font-bold text-[#FACC15] bg-[#111827] px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#111827] leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {article.description}
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/blog"
                  className="group inline-flex items-center text-[#111827] font-bold text-sm hover:text-[#FACC15] transition-colors"
                >
                  <span>{article.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom Action Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-4 text-center"
        >
          <Link
            href="/blog"
            className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-6 pr-1.5 py-2.5 text-sm font-bold shadow-lg shadow-[#FACC15]/20 transition-all"
          >
            <span>Explore All Articles</span>
            <div className="ml-3 w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-[#FACC15]" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
