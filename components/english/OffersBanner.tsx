'use client';

import { ChevronsRight, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OffersBanner() {
  return (
    <section className="bg-white py-16 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-[#FEFCE8] via-[#FEF9C3] to-[#FEF08A] border-2 border-[#FACC15] p-8 sm:p-14 rounded-3xl text-center space-y-6 shadow-xl overflow-hidden"
        >
          <Sparkles className="w-8 h-8 text-[#FACC15] fill-[#FACC15] absolute top-4 left-6" />
          <Sparkles className="w-6 h-6 text-[#FACC15] fill-[#FACC15] absolute bottom-4 right-8" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1 shadow-md">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">Individual Offers</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight max-w-3xl mx-auto leading-tight">
            Elevate Your English Skills With High-Quality Programs For Every Level
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto font-medium">
            Take advantage of our limited-time special capsules offer and start your journey toward English fluency today.
          </p>

          {/* Button */}
          <div className="pt-2">
            <a
              href="#courses"
              className="group inline-flex items-center bg-[#111827] hover:bg-black text-white rounded-full pl-6 pr-1.5 py-3 text-xs font-extrabold shadow-2xl transition-all"
            >
              <span>Grab Your Offer Now</span>
              <div className="ml-3 w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-[#111827]" />
              </div>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
