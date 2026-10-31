import { motion } from 'framer-motion';
import { ChevronsRight, ArrowRight } from 'lucide-react';
import { getSuccessStories } from '@/lib/cms-db';

export default async function SuccessStories() {
  const stories = await getSuccessStories();
  if (stories.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ── Section Header ── */}
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          {/* Real Learning Journeys Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">REAL LEARNING JOURNEYS</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            Small Steps. Big Dreams. Real Progress.
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Every learning journey starts somewhere. Discover how learners build new skills, overcome challenges, and work toward their goals through learning, practice, and persistence.
          </p>
        </div>

        {/* ── 4-Column Success Stories Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="bg-[#FEFCE8]/60 border border-[#FEF9C3] hover:border-[#FACC15]/60 hover:shadow-lg hover:shadow-[#FACC15]/10 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between h-full hover:-translate-y-2"
            >
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-[#111827] leading-tight min-h-[3.5rem]">
                  {story.headline}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {story.description}
                </p>
              </div>
              <div className="pt-4 border-t border-[#FACC15]/20">
                <p className="text-xs text-slate-500 italic">
                  {story.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Action Button ── */}
        <div className="pt-4 text-center">
          <a
            href="#contact"
            className="group inline-flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-6 pr-1.5 py-2.5 text-sm font-bold shadow-lg shadow-[#FACC15]/20 transition-all"
          >
            <span>Start Your Journey</span>
            <div className="ml-3 w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-[#FACC15]" />
            </div>
          </a>
        </div>

      </div>
    </section>
  );
}
