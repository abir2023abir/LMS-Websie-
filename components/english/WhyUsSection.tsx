'use client';

import Image from 'next/image';
import { ChevronsRight, Award, Users, ShieldCheck, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: 'Structured Learning Path',
    description: 'Know what to study next and follow the course structure.',
  },
  {
    icon: Award,
    title: 'Measurable Progress',
    description: 'Review your learning activity and assessment performance.',
  },
  {
    icon: Banknote,
    title: 'Guided Support',
    description: 'Use available mentor, student, and programme support features.',
  },
  {
    icon: Users,
    title: 'Goal-Oriented Practice',
    description: 'Connect course activities with the skills you want to develop.',
  },
];

export default function WhyUsSection() {
  return (
    <section id="why-us" className="bg-white py-20 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">WHY US</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight">
            A Smarter Way to Learn and Grow
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Build a consistent learning routine with organised courses, useful feedback, and clear progress information.
          </p>
        </div>

        {/* Two Column Layout: Left Image, Right 4 Grid Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Student Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FEF9C3]"
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=750&fit=crop"
              alt="Learner studying online"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Right Column: 4 Feature Grid Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#FEFCE8]/70 border border-[#FEF9C3] rounded-3xl p-6 space-y-3 hover:border-[#FACC15]/50 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#111827]">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
