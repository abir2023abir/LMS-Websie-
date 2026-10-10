'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronsRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningMethodsSection() {
  const [activeTab, setActiveTab] = useState<'online' | 'inperson'>('online');

  return (
    <section id="methods" className="bg-white py-20 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">Learning Methods</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight">
            Choose The Learning Style That Fits You Best
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Whether from the comfort of your home or join face-to-face sessions — English Capsules gives you both with equal quality and care.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="bg-[#FEF9C3] p-1.5 rounded-full border border-[#FACC15]/40 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('online')}
              className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'online'
                  ? 'bg-[#111827] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#111827]'
              }`}
            >
              Online Learning
            </button>
            <button
              onClick={() => setActiveTab('inperson')}
              className={`px-6 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'inperson'
                  ? 'bg-[#111827] text-white shadow-md'
                  : 'text-slate-700 hover:text-[#111827]'
              }`}
            >
              In-Person Learning
            </button>
          </div>
        </div>

        {/* Method Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FEFCE8]/50 border border-[#FEF9C3] p-8 sm:p-12 rounded-3xl">
          {/* Left Column: Image Collage */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative aspect-video sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white"
          >
            <Image
              src={
                activeTab === 'online'
                  ? 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&h=450&fit=crop'
                  : 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=450&fit=crop'
              }
              alt="Learning Style"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Right Column: Checkbox Features */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-[#111827] mb-2">
                {activeTab === 'online' ? 'Online Learning' : 'In-Person Campus Learning'}
              </h3>
              <p className="text-xs text-slate-600">
                {activeTab === 'online'
                  ? 'Learn anytime, anywhere with full flexibility and live interactive support.'
                  : 'Experience face-to-face interaction at our modern campus branches.'}
              </p>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
              {[
                activeTab === 'online'
                  ? 'Learn on your own time, from anywhere.'
                  : 'Direct face-to-face feedback from expert tutors.',
                activeTab === 'online'
                  ? 'Interact directly with your instructor online.'
                  : 'Structured classroom environment to boost focus.',
                activeTab === 'online'
                  ? 'Save time and transportation costs.'
                  : 'Group activities and peer speaking practice.',
                'Get the same certified learning quality.',
                'Access recorded sessions anytime.',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#FACC15] fill-[#111827] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href="#courses"
                className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-6 pr-1.5 py-2.5 text-xs font-extrabold shadow-md transition-all"
              >
                <span>Explore Offers</span>
                <div className="ml-3 w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
