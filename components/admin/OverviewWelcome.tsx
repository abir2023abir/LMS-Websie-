'use client';

import { GraduationCap } from 'lucide-react';

/** "Good morning / afternoon / evening" by the time in Bangladesh. */
function greeting() {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Dhaka' }));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/**
 * Top of the admin Overview: a greeting with the signed-in name and role. (The website menu is
 * not shown inside the admin panel.)
 */
export default function OverviewWelcome({ name, title }: { name: string; title: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-3xl border border-[#FACC15]/40 bg-gradient-to-r from-[#FEF9C3] to-white p-5 shadow-sm">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><GraduationCap className="h-7 w-7" /></span>
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">{greeting()}, {name || 'Admin'} <span aria-hidden="true">👋</span></p>
          <p className="text-sm text-slate-600">{title}</p>
        </div>
      </div>
    </div>
  );
}
