'use client';

import Image from 'next/image';
import { ArrowRight, ChevronsRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* ── LEFT COLUMN: TEXT CONTENT ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 pb-8 lg:pb-16 z-20"
          >
            {/* Welcome Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 border border-black/20 shadow-md"
            >
              <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold tracking-wide">Welcome</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.08] tracking-tight"
            >
              The Largest Community For Learning English
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg text-[#111827]/85 font-medium leading-relaxed max-w-xl"
            >
              With English Capsules, you&apos;ll learn English in a practical and easy way — no complexity, no boring memorization. Short, effective sessions designed to fit your time and goals.
            </motion.p>

            {/* Contact Us Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <a
                href="#contact"
                className="group inline-flex items-center bg-[#111827] hover:bg-black text-white rounded-full pl-6 pr-1.5 py-2.5 text-sm font-bold shadow-2xl transition-all hover:scale-105"
              >
                <span>Contact Us</span>
                <div className="ml-3 w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#FACC15]" />
                </div>
              </a>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN: LARGE STUDENT IMAGE PORTRAIT ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end items-end"
          >
            {/* Infinite Subtle Floating Large Image Container */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="relative w-full max-w-lg lg:max-w-xl h-[480px] sm:h-[580px] lg:h-[660px] z-20"
            >
              <Image
                src="/images/student.png"
                alt="English Student"
                fill
                priority
                className="object-contain object-bottom drop-shadow-2xl scale-110 origin-bottom"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            {/* Floating Star / Spark SVG icons */}
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute left-0 bottom-20 z-30 hidden sm:block"
            >
              <div className="flex flex-col gap-1 text-[#FACC15]">
                <Sparkles className="w-10 h-10 fill-[#FACC15] drop-shadow-lg" />
                <Sparkles className="w-6 h-6 fill-[#FACC15] translate-x-4" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM BLACK SVG WAVE DIVIDER ── */}
      <div className="relative w-full overflow-hidden leading-none z-10 -mt-8 sm:-mt-12 lg:-mt-16">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-28 sm:h-40 lg:h-52 text-[#111827]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L80,85.3C160,107,320,149,480,149.3C640,149,800,107,960,90.7C1120,75,1280,85,1360,90.7L1440,96L1440,220L1360,220C1280,220,1120,220,960,220C800,220,640,220,480,220C320,220,160,220,80,220L0,220Z"
            fill="#111827"
          />
        </svg>
      </div>
    </section>
  );
}
