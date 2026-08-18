'use client';

import { ArrowRight, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

const statCards = [
  { value: '+10', label: 'Training Program', highlighted: false },
  { value: '+1.5k', label: 'Online Course', highlighted: false },
  { value: '+40k', label: 'Successful Student', highlighted: false },
  { value: '+9', label: 'Years of Experience', highlighted: true },
];

export default function StatsSection() {
  return (
    <section id="about" className="bg-white py-16 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-4xl"
        >
          {/* Who We Are Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">Who we are</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            From 2015 Till Now We Have New Educated People
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            We have set our goal to be more than just an educational center. We give our students a different experience based on quality education, personalized follow-up, and innovative ways of training. What distinguishes us is that we don&apos;t just teach the language, we create an enjoyable learning experience that helps our students become confident, develop, and achieve their goals.
          </p>
        </motion.div>

        {/* ── 4-Column Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-8 text-center flex flex-col justify-center items-center shadow-sm border transition-all ${
                card.highlighted
                  ? 'bg-[#FEF08A] border-[#FACC15] shadow-lg shadow-[#FACC15]/20'
                  : 'bg-[#FEFCE8]/60 border-[#FEF9C3] hover:border-[#FACC15]/40'
              }`}
            >
              <div className="font-display font-extrabold text-4xl sm:text-5xl text-[#111827] mb-2 tracking-tight">
                {card.value}
              </div>
              <div className="text-sm font-semibold text-slate-600">
                {card.label}
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
          className="pt-4"
        >
          <a
            href="#contact"
            className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-6 pr-1.5 py-2.5 text-sm font-bold shadow-lg shadow-[#FACC15]/20 transition-all"
          >
            <span>Contact Us</span>
            <div className="ml-3 w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-[#FACC15]" />
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
