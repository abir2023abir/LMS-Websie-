'use client';

import { ArrowRight, ChevronsRight } from 'lucide-react';

type HeroAnimationsProps = {
  heroData: {
    headline: string;
    description: string;
    cta1Text: string;
    cta1Link: string;
    cta2Text: string;
    cta2Link: string;
    badgeText: string;
  };
};

export default function HeroAnimations({ heroData }: HeroAnimationsProps) {
  return (
    <div className="min-w-0 lg:col-span-6 space-y-2 sm:space-y-6 pb-1 sm:pb-8 lg:pb-16 z-20">
      {/* Welcome Pill Badge */}
      <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#111827] text-white rounded-full px-2 sm:px-3.5 py-1 sm:py-1.5 border border-black/20 shadow-md">
        <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
          <ChevronsRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold tracking-wide">{heroData.badgeText}</span>
      </div>

      {/* Main Headline */}
      <h1 className="font-display font-extrabold text-[clamp(1.1rem,5.4vw,2rem)] sm:text-5xl lg:text-6xl text-[#111827] leading-[1.04] sm:leading-[1.08] tracking-tight break-words">
        {heroData.headline}
      </h1>

      {/* Description */}
      <p className="text-[10px] min-[400px]:text-xs sm:text-lg text-[#111827]/85 font-medium leading-snug sm:leading-relaxed max-w-xl">
        <span className="sm:hidden">{heroData.description}</span>
        <span className="hidden sm:inline">{heroData.description}</span>
      </p>

      {/* Action Buttons */}
      <div className="pt-1 sm:pt-2 flex flex-col items-stretch gap-1.5 sm:flex-row sm:flex-wrap sm:gap-3">
        <a
          href={heroData.cta1Link}
          className="group inline-flex items-center justify-between bg-[#111827] hover:bg-black text-white rounded-full pl-2.5 sm:pl-6 pr-1 py-1 sm:py-2.5 text-[10px] sm:text-sm font-bold shadow-2xl transition-all hover:scale-105"
        >
          <span>{heroData.cta1Text}</span>
          <div className="ml-1 sm:ml-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
          </div>
        </a>
        <a
          href={heroData.cta2Link}
          className="group inline-flex items-center justify-between bg-white hover:bg-gray-100 text-[#111827] rounded-full pl-2.5 sm:pl-6 pr-1 py-1 sm:py-2.5 text-[10px] sm:text-sm font-bold shadow-xl transition-all hover:scale-105 border-2 border-[#111827]"
        >
          <span>{heroData.cta2Text}</span>
          <div className="ml-1 sm:ml-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#111827] group-hover:bg-black flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FACC15]" />
          </div>
        </a>
      </div>
    </div>
  );
}
