'use client';

import { motion } from 'framer-motion';
import { ChevronsRight, ArrowRight } from 'lucide-react';

const liveProgrammes = [
  {
    title: 'Career Orientation Session',
    description: 'Explore learning pathways, identify areas for skill development, and understand the next steps toward your goals.',
    cta: 'View Programme',
  },
  {
    title: 'Course Introduction & Orientation',
    description: 'Learn about available courses, their learning objectives, expected activities, and programme requirements.',
    cta: 'View Programme',
  },
  {
    title: 'Skills Development Workshop',
    description: 'Discover practical learning activities and ways to apply knowledge through guided practice.',
    cta: 'View Programme',
  },
];

export default function LiveProgrammesSection() {
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
          {/* Live Programmes Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">LIVE PROGRAMMES & ORIENTATION</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            Join a Programme. Discover Your Next Step.
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Explore live orientation sessions, programme introductions, workshops, and scheduled learning events designed to help you understand your options before choosing your learning path.
          </p>
        </motion.div>

        {/* ── 3-Column Live Programmes Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {liveProgrammes.map((programme, index) => (
            <motion.div
              key={programme.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-[#FEFCE8]/60 border border-[#FEF9C3] hover:border-[#FACC15]/40 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-[#111827] leading-tight">
                  {programme.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {programme.description}
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="#contact"
                  className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1.5 text-xs font-bold transition-all shadow-md shadow-[#FACC15]/20"
                >
                  <span>{programme.cta}</span>
                  <div className="ml-2 w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                  </div>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
