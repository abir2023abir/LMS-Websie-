'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { youtubeId } from '@/components/player/YoutubeLesson';

export type StoryCard = { id: string; headline: string; description: string; caption: string; videoUrl?: string };

const FIRST_ROWS = 4;

function StoryVideo({ story }: { story: StoryCard }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(story.videoUrl);

  if (!id) {
    // A story without a video still gets the same frame, so the grid stays even.
    return (
      <div className="flex aspect-video items-center justify-center bg-[#111827] px-6 text-center">
        <p className="font-display text-lg font-extrabold leading-snug text-[#FACC15]">{story.headline}</p>
      </div>
    );
  }

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full bg-black"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={story.headline}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${story.headline}`}
      className="group/video relative block aspect-video w-full overflow-hidden bg-[#111827] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#FACC15]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/video:scale-105"
      />
      <span className="absolute inset-0 bg-[#111827]/35 transition-colors group-hover/video:bg-[#111827]/20" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FACC15] text-[#111827] shadow-xl transition-transform group-hover/video:scale-110">
        <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
      </span>
    </button>
  );
}

export default function SuccessStoryGrid({ stories }: { stories: StoryCard[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? stories : stories.slice(0, FIRST_ROWS);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((story) => (
          <article
            key={story.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)] transition hover:-translate-y-1 hover:border-[#FACC15]"
          >
            <StoryVideo story={story} />
            <div className="flex flex-1 flex-col gap-2 border-t border-slate-200 p-5 sm:p-6">
              <h3 className="font-display text-lg font-extrabold leading-snug text-[#111827]">{story.headline}</h3>
              {story.description && <p className="text-sm leading-relaxed text-slate-600">{story.description}</p>}
              <p className="mt-auto pt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#A16207]">{story.caption || 'Story'}</p>
            </div>
          </article>
        ))}
      </div>

      {stories.length > FIRST_ROWS && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            className="inline-flex min-h-11 items-center rounded-full border-2 border-[#D4AF37] bg-[#FACC15] px-7 text-sm font-bold text-[#111827] transition hover:bg-[#EAB308]"
          >
            {showAll ? 'See Less' : 'See More'}
          </button>
        </div>
      )}
    </>
  );
}
