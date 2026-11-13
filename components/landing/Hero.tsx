import Image from 'next/image';
import { ArrowRight, ChevronsRight, Sparkles } from 'lucide-react';
import { getHeroContent } from '@/lib/cms-db';
import HeroAnimations from './HeroAnimations';

export default async function Hero() {
  const content = await getHeroContent();

  // Fallback content if API fails or no content exists
  const heroData = {
    ...(content || {
    headline: 'Build Your Skills. Bridge the Gap to Your Future.',
    description: 'Learn practical skills, follow structured lessons, and turn your knowledge into real-world progress. Career Bridge.Studio brings courses, assessments, and learning progress together in one place.',
    cta1Text: 'Explore Courses',
    cta1Link: '#courses',
    cta2Text: 'Bookkeeping',
    cta2Link: '/bookkeeping',
    imageUrl: '/images/student.png',
    badgeText: 'Start Learning',
    }),
    // Keep this CTA pointed at the dedicated service page, including for older CMS records.
    cta2Link: '/bookkeeping',
  };

  return (
    <section className="relative flex flex-col overflow-hidden bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-24 sm:h-screen sm:h-[100svh] sm:min-h-[100vh] sm:pt-28 lg:h-auto lg:pt-36">
      <div className="relative z-10 flex flex-1 flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid flex-1 grid-cols-2 grid-rows-1 gap-2 sm:gap-4 lg:grid-cols-12 lg:gap-6 items-center">

          {/* ── LEFT COLUMN: TEXT CONTENT ── */}
          <HeroAnimations heroData={heroData} />
          
          {/* ── RIGHT COLUMN: LEARNER VISUAL - BRIDGE TO CAREER ── */}
          <div className="min-w-0 lg:col-span-6 relative min-h-0 h-full self-end sm:self-auto flex justify-center lg:justify-end items-end">
            {/* Infinite Subtle Floating Image Container */}
            <div className="relative w-full max-w-lg lg:max-w-xl h-[clamp(15rem,74vw,22rem)] min-h-0 sm:h-[580px] lg:h-[660px] z-20 animate-float">
              {heroData.imageUrl.startsWith('/') ? (
                <Image
                  src={heroData.imageUrl}
                  alt="Learner at the start of a career development journey"
                  fill
                  priority
                  className="object-contain object-bottom drop-shadow-2xl scale-100 sm:scale-110 origin-bottom"
                  sizes="(max-width: 640px) 60vw, 50vw"
                />
              ) : (
                // Uploaded CMS photos are stored with the page content, not as a site file.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroData.imageUrl}
                  alt="Learner at the start of a career development journey"
                  className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-2xl scale-100 sm:scale-110 origin-bottom"
                />
              )}
            </div>

            {/* Floating Star / Spark SVG icons */}
            <div className="absolute left-0 bottom-20 z-30 hidden sm:block animate-rotate">
              <div className="flex flex-col gap-1 text-[#FACC15]">
                <Sparkles className="w-10 h-10 fill-[#FACC15] drop-shadow-lg" />
                <Sparkles className="w-6 h-6 fill-[#FACC15] translate-x-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BLACK SVG WAVE DIVIDER ── */}
      <div className="relative mt-auto -mb-px w-full shrink-0 overflow-hidden leading-none z-10 -mt-2 sm:-mt-12 lg:-mt-16">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-full h-10 sm:h-40 lg:h-52 text-[#111827]"
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
