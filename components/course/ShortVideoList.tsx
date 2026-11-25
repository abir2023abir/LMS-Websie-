'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Film, Pencil, Play, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ShortVideo } from '@/lib/course-community';
import YoutubeLesson, { directVideoSrc, youtubeId } from '@/components/player/YoutubeLesson';

const PAGE = 10;

/** The address someone can open: uploaded files go through the access-checked player route. */
const linkOf = (video: ShortVideo) => (video.url.startsWith('r2:') ? `${window.location.origin}${directVideoSrc(video.url)}` : video.url);
/** Uploaded files and direct video files play here; other websites open in a new tab. */
const playsHere = (url: string) => Boolean(youtubeId(url)) || url.startsWith('r2:') || /\.(mp4|webm|mov)(\?|$)/i.test(url);

function Player({ video, onClose }: { video: ShortVideo; onClose: () => void }) {
  useEffect(() => {
    // Escape closes only the player, not the window behind it.
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  const youtube = youtubeId(video.url);
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={video.title} className="w-full max-w-3xl overflow-hidden rounded-3xl bg-[#111827]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
          <p className="truncate text-sm font-bold">{video.title}</p>
          <button type="button" onClick={onClose} aria-label="Close video" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="aspect-video bg-black">
          {youtube
            ? <YoutubeLesson id={youtube} title={video.title} autoStart />
            : <video src={directVideoSrc(video.url)} controls autoPlay playsInline controlsList="nodownload" className="h-full w-full" />}
        </div>
        {video.description && <p className="max-h-32 overflow-y-auto whitespace-pre-wrap px-4 py-3 text-sm text-slate-300">{video.description}</p>}
      </div>
    </div>
  );
}

/** The short video list: module, lesson, lecture number and title, with Copy and Play. */
export default function ShortVideoList({ videos, onEdit, onDelete }: { videos: ShortVideo[]; onEdit?: (video: ShortVideo) => void; onDelete?: (video: ShortVideo) => void }) {
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState<ShortVideo | null>(null);
  const [copied, setCopied] = useState('');
  const pages = Math.max(1, Math.ceil(videos.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = videos.slice(current * PAGE, current * PAGE + PAGE);

  const copy = async (video: ShortVideo) => {
    try {
      await navigator.clipboard.writeText(linkOf(video));
      setCopied(video.id);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  if (!videos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <Film className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        No short videos yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {rows.map((video) => (
          <li key={video.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1 basis-56">
              <p className="truncate text-[11px] font-semibold text-slate-500">{[video.moduleTitle || 'Whole course', video.lessonTitle].filter(Boolean).join(' · ')}</p>
              <p className="truncate font-bold text-[#111827]">{video.title}</p>
              <p className="text-[11px] font-bold text-[#A16207]">Lecture {video.id}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => copy(video)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                {copied === video.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copied === video.id ? 'Copied' : 'Copy'}
              </button>
              {playsHere(video.url) ? (
                <button type="button" onClick={() => setPlaying(video)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#FACC15] px-4 text-xs font-extrabold text-[#111827] hover:bg-[#EAB308]"><Play className="h-3.5 w-3.5 fill-current" />Play</button>
              ) : (
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#FACC15] px-4 text-xs font-extrabold text-[#111827] hover:bg-[#EAB308]"><ExternalLink className="h-3.5 w-3.5" />Play</a>
              )}
              {onEdit && <button type="button" onClick={() => onEdit(video)} aria-label={`Edit ${video.title}`} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>}
              {onDelete && <button type="button" onClick={() => onDelete(video)} aria-label={`Delete ${video.title}`} className="flex h-10 w-10 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p>Showing {current * PAGE + 1}–{current * PAGE + rows.length} of {videos.length}</p>
        {pages > 1 && (
          <div className="flex gap-1.5">
            <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="min-h-9 rounded-full border border-slate-200 px-3.5 font-bold text-slate-700 disabled:opacity-40">Previous</button>
            <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="min-h-9 rounded-full border border-slate-200 px-3.5 font-bold text-slate-700 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
      {playing && <Player video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
