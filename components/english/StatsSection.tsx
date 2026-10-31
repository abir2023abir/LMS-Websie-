'use client';

import { ArrowRight, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

const statCards = [
  { value: '01', label: 'Structured Learning Programmes', highlighted: false },
  { value: '02', label: 'Practical Lessons & Activities', highlighted: false },
  { value: '03', label: 'Trackable Learning Progress', highlighted: false },
  { value: '04', label: 'Goal-Focused Skill Development', highlighted: true },
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
            <span className="text-xs font-bold tracking-wide">WHO WE ARE</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            A Better Learning Journey, Built Around Your Goals
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Career Bridge.Studio helps learners develop knowledge, strengthen practical skills, and follow a structured path toward personal and professional growth. Learn through organised lessons, practise your skills, and track your progress as you move forward.
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
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mb-3 tracking-tight">
                {card.value}
              </div>
              <div className="text-sm font-semibold text-slate-600 leading-relaxed">
                {card.label}
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
