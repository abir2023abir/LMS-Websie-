import { getSuccessStories } from '@/lib/cms-db';
import SuccessStoryGrid from '@/components/landing/SuccessStoryGrid';

/**
 * Client layout, section 07: business advice videos. They are the Success Stories marked
 * "Bookkeeping page" in Admin → Landing Page CMS; the caption is the topic. Hidden until one exists.
 */
export default async function BusinessInsights() {
  const videos = (await getSuccessStories().catch(() => [])).filter((story) => story.page === 'bookkeeping');
  if (videos.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#A16207]">BUSINESS INSIGHTS &amp; ADVICE</p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Small Steps. Smart Business. Real Growth.</h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">Explore practical business advice, financial insights, and expert guidance to help business owners make better decisions and grow their businesses.</p>
        </div>
        <SuccessStoryGrid
          stories={videos.map((video, index) => ({
            id: video.id || String(index),
            headline: video.headline,
            description: video.description,
            caption: video.caption,
            videoUrl: video.videoUrl,
          }))}
        />
      </div>
    </section>
  );
}
