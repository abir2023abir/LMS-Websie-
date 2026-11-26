import { ChevronsRight } from 'lucide-react';
import SuccessStoryGrid from './SuccessStoryGrid';
import { getSuccessStories } from '@/lib/cms-db';

export default async function SuccessStories() {
  const stories = (await getSuccessStories()).filter((story) => (story.page || 'home') === 'home');
  // Client rule: a part with no data is not shown; it appears as soon as the admin adds a story.
  if (stories.length === 0) return null;
  return (
    <section className="bg-white py-10 sm:py-24 text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-12">
        {/* ── Section Header ── */}
        <div className="mx-auto max-w-4xl space-y-3 text-center sm:space-y-4">
          {/* Real Learning Journeys Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
            <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wide">REAL LEARNING JOURNEYS</span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
            Small Steps. Big Dreams. Real Progress.
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-[13px] sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Every learning journey starts somewhere. Discover how learners build new skills, overcome challenges, and work toward their goals through learning, practice, and persistence.
          </p>
        </div>

        {/* ── Two-column video story cards, four at first, then "See More" ── */}
        <SuccessStoryGrid
          stories={stories.map((story, index) => ({
            id: story.id || String(index),
            headline: story.headline,
            description: /sample text for layout preview/i.test(story.description || '') ? '' : story.description,
            caption: /\[sample\]/i.test(story.caption || '') ? 'Story' : story.caption,
            videoUrl: story.videoUrl,
          }))}
        />
      </div>
    </section>
  );
}
