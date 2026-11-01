'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Crown, Flame, Trophy } from 'lucide-react';

type Course = { courseId: string; courseTitle: string; percent: number; lessonsDone: number; lessonsTotal: number; currentLesson: string; nextStep: string; rank: number | null; rankTotal: number; xp: number };
type Summary = { xp: number; level: { number: number; name: string; nextName: string | null; nextAt: number | null; from: number }; courses: Course[] };

function Ring({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={percent === 100 ? '#10b981' : '#FACC15'} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100} className="transition-all duration-700" />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-[#111827] text-[13px] font-extrabold" style={{ transformOrigin: '32px 32px' }}>{percent}%</text>
    </svg>
  );
}

/** The student's own level, points, rank and next step per course (no other students shown). */
export default function MyProgressPanel() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('/api/student/progress-summary', { cache: 'no-store' }).then((res) => (res.ok ? res.json() : null)).then(setData).catch(() => undefined);
  }, []);

  if (!data) return <div className="h-40 animate-pulse rounded-3xl bg-white" />;
  if (data.courses.length === 0) return null;
  const { level } = data;
  const toNext = level.nextAt ? Math.round(((data.xp - level.from) / (level.nextAt - level.from)) * 100) : 100;

  return (
    <section className="space-y-4">
      {/* Level card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#FACC15]/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FACC15] text-[#111827] shadow-lg shadow-[#FACC15]/30">
            {level.number >= 5 ? <Crown className="h-8 w-8" /> : <Award className="h-8 w-8" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">Level {level.number}</p>
            <p className="font-display text-2xl font-extrabold">{level.name}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#FACC15] transition-all duration-700" style={{ width: `${Math.min(100, toNext)}%` }} /></div>
            <p className="mt-1 text-xs text-slate-300">{level.nextAt ? `${data.xp} / ${level.nextAt} XP · ${level.nextAt - data.xp} XP to ${level.nextName}` : `${data.xp} XP · top level reached`}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
            <Flame className="h-5 w-5 text-[#FACC15]" />
            <div><p className="font-display text-xl font-extrabold leading-none">{data.xp}</p><p className="text-[11px] text-slate-300">total XP</p></div>
          </div>
        </div>
      </div>

      {/* Per course */}
      <div className="grid gap-3 md:grid-cols-2">
        {data.courses.map((course) => (
          <div key={course.courseId} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <Ring percent={course.percent} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-[#111827]">{course.courseTitle}</p>
              <p className="text-xs text-slate-500">{course.lessonsDone} of {course.lessonsTotal} lessons · {course.xp} XP</p>
              {course.percent === 100 ? (
                <p className="mt-1 text-xs font-bold text-emerald-700">Course complete 🎉</p>
              ) : (
                <p className="mt-1 truncate text-xs text-slate-600">Next: <strong>{course.nextStep}</strong>{course.currentLesson ? ` · ${course.currentLesson}` : ''}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {course.rank && <span className="flex items-center gap-1 rounded-full bg-[#FEF9C3] px-2.5 py-1 text-xs font-extrabold text-[#A16207]"><Trophy className="h-3.5 w-3.5" />#{course.rank}<span className="font-semibold text-[#A16207]/70">/{course.rankTotal}</span></span>}
              <Link href={`/student/learn/${encodeURIComponent(course.courseId)}`} className="flex items-center gap-1 rounded-xl bg-[#111827] px-3 py-1.5 text-xs font-bold text-white">{course.percent === 100 ? 'Review' : 'Continue'}<ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
