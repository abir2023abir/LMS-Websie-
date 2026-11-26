'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronsRight, Clock, MonitorPlay, Timer } from 'lucide-react';

type LiveProgramme = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string | null;
  duration?: string | null;
  format?: string | null;
  status?: string | null;
  registration_url?: string | null;
  image_url?: string;
  venue?: string;
};

/**
 * Part A of the client's "Learning Programmes & Courses" layout: live programmes and orientation
 * sessions (LIVE ONLINE · Upcoming cards). Shown on the home page and the All Courses page.
 * With `hideWhenEmpty` (the home page) the whole part is left out until a programme is scheduled.
 */
export default function LiveProgrammes({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean } = {}) {
  const [liveProgrammes, setLiveProgrammes] = useState<LiveProgramme[]>([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/landing/orientation-programmes', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Could not load programmes'))))
      .then((data) => {
        if (active) setLiveProgrammes(Array.isArray(data.programmes) ? data.programmes : []);
      })
      .catch(() => {
        if (active) setLiveProgrammes([]);
      })
      .finally(() => {
        if (active) setProgrammesLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (hideWhenEmpty && liveProgrammes.length === 0) return null;

  return (
      <div className="bg-white py-8 sm:py-24 text-[#111827]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto space-y-3 max-w-4xl text-center sm:space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1.5">
              <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full flex items-center justify-center">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-wide">LIVE PROGRAMMES & ORIENTATION</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight">
              Join a Programme. Discover Your Next Step.
            </h2>

            <p className="text-slate-600 text-[13px] sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
              Explore live orientation sessions, programme introductions, workshops, and scheduled learning events designed to help you understand your options before choosing your learning path.
            </p>
          </motion.div>

          {/* Only programmes that have a real upcoming schedule are published. */}
          {programmesLoading ? (
            <div className="grid grid-cols-2 gap-2.5 md:gap-6">
              <div className="h-52 animate-pulse rounded-2xl bg-slate-100 md:h-80 md:rounded-3xl" />
              <div className="h-52 animate-pulse rounded-2xl bg-slate-100 md:h-80 md:rounded-3xl" />
            </div>
          ) : liveProgrammes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center sm:px-6 sm:py-12">
              <CalendarDays className="mx-auto h-6 w-6 text-[#A16207] sm:h-10 sm:w-10" />
              <p className="mt-1 font-display text-sm font-extrabold text-[#111827] sm:mt-3 sm:text-lg">No programme is scheduled right now</p>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">New live programmes and orientation sessions will appear here as soon as they are announced.</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-2.5 md:gap-6">
            {liveProgrammes.map((programme, index) => {
              const date = new Date(programme.event_date);
              const external = programme.registration_url?.startsWith('http');
              return (
                <motion.article
                  key={programme.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)] transition hover:-translate-y-1 hover:border-[#FACC15]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#111827]">
                    {programme.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={programme.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FACC15]">
                        <span className="mt-4 font-display text-3xl font-extrabold leading-none md:mt-0 md:text-6xl">{date.toLocaleDateString('en-BD', { day: 'numeric', timeZone: 'Asia/Dhaka' })}</span>
                        <span className="mt-1 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-white md:mt-2 md:text-sm md:tracking-[0.2em]">{date.toLocaleDateString('en-BD', { month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-1.5 top-1.5 flex items-start justify-between gap-1 md:inset-x-3 md:top-3 md:gap-2">
                      <span className="rounded-full bg-[#FACC15] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#111827] shadow md:px-3 md:py-1 md:text-[11px]">{programme.format || 'Live Online'}</span>
                      <span className="rounded-full border border-white/20 bg-[#111827]/90 px-1.5 py-0.5 text-[8px] font-extrabold text-[#FACC15] shadow md:px-3 md:py-1 md:text-[11px]">Upcoming</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 border-t border-slate-200 p-2.5 sm:gap-3 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] font-semibold text-slate-500 md:gap-x-4 md:text-xs">
                      <span className="flex items-center gap-1.5"><MonitorPlay className="h-4 w-4 shrink-0 text-[#A16207]" />{programme.venue || programme.format || 'Online'}</span>
                      {programme.event_time && <span className="flex items-center gap-1.5 font-bold text-[#111827]"><Clock className="h-4 w-4 shrink-0 text-[#A16207]" />{programme.event_time}</span>}
                    </div>
                    <h3 className="font-display text-[13px] font-extrabold leading-snug text-[#111827] md:text-xl">{programme.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-600 max-md:line-clamp-3 md:text-sm">{programme.description.replace(/\s*\[sample\]\s*/gi, '').trim()}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[10px] text-slate-500 md:gap-x-4 md:text-xs">
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 shrink-0 text-[#A16207]" />{date.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })}</span>
                      {programme.duration && <span className="flex items-center gap-1.5"><Timer className="h-4 w-4 shrink-0 text-[#A16207]" />{programme.duration}</span>}
                      {programme.status && <span>{programme.status}</span>}
                    </div>
                    {programme.registration_url && (
                      <a
                        href={programme.registration_url}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="group inline-flex items-center justify-between self-stretch rounded-full bg-[#FACC15] py-1.5 pl-3 pr-1 text-[11px] font-bold md:justify-start md:self-start md:pl-4 md:text-xs text-[#111827] shadow-md shadow-[#FACC15]/20 transition-all hover:bg-[#eab308]"
                      >
                        <span>{programme.status?.toLowerCase().includes('open') ? 'Register Now' : 'View Programme'}</span>
                        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#111827]">
                          <ArrowRight className="h-3.5 w-3.5 text-[#FACC15]" />
                        </span>
                      </a>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
          )}
        </div>
      </div>
  );
}
