'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { youtubeId } from '@/components/player/YoutubeLesson';

export type StoryCard = { id: string; headline: string; description: string; caption: string; videoUrl?: string };

const FIRST_ROWS = 4;

function StoryVideo({ story, playing, onPlay }: { story: StoryCard; playing: boolean; onPlay: () => void }) {
  const id = youtubeId(story.videoUrl);

  if (!id) {
    // A story without a video still gets the same frame, so the grid stays even.
    return (
      <div className="flex aspect-video items-center justify-center bg-[#111827] px-2 text-center sm:px-6">
        <p className="font-display text-xs font-extrabold leading-snug text-[#FACC15] sm:text-lg">{story.headline}</p>
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
      onClick={onPlay}
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
      <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FACC15] text-[#111827] shadow-xl transition-transform group-hover/video:scale-110 sm:h-16 sm:w-16">
        <Play className="ml-0.5 h-4 w-4 fill-current sm:ml-1 sm:h-7 sm:w-7" aria-hidden="true" />
      </span>
    </button>
  );
}

/** On a phone the cards sit two by two; a playing or opened card takes the whole width. */
function StoryItem({ story }: { story: StoryCard }) {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wide = playing || expanded;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)] transition hover:-translate-y-1 hover:border-[#FACC15] sm:rounded-3xl ${wide ? 'col-span-2 md:col-span-1' : ''}`}
    >
      <StoryVideo story={story} playing={playing} onPlay={() => setPlaying(true)} />
      <div className="flex flex-1 flex-col gap-1 border-t border-slate-200 p-2.5 sm:gap-2 sm:p-6">
        <h3 className={`font-display text-[13px] font-extrabold leading-snug text-[#111827] sm:text-lg ${wide ? '' : 'max-md:line-clamp-2'}`}>{story.headline}</h3>
        {story.description && <p className={`text-xs leading-relaxed text-slate-600 sm:text-sm ${wide ? '' : 'max-md:line-clamp-2'}`}>{story.description}</p>}
        <p className="mt-auto pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#A16207] sm:text-xs sm:tracking-[0.16em]">{story.caption || 'Story'}</p>
        {story.description && (
          <button type="button" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded} className="min-h-8 self-start text-[11px] font-extrabold text-[#111827] underline md:hidden">
            {expanded ? 'See Less' : 'Read More'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function SuccessStoryGrid({ stories }: { stories: StoryCard[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? stories : stories.slice(0, FIRST_ROWS);

  return (
    <>
      <div className="grid grid-flow-row-dense grid-cols-2 gap-2.5 md:grid-flow-row md:gap-6">
        {visible.map((story) => <StoryItem key={story.id} story={story} />)}
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
