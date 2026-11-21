'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';

const SITE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'All Courses', href: '/courses' },
  { label: 'Bookkeeping', href: '/bookkeeping' },
  { label: 'Contact', href: '/contact' },
];

/** "Good morning / afternoon / evening" by the time in Bangladesh. */
function greeting() {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Dhaka' }));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/**
 * Top of the admin Overview (client layout): the website's own menu, then a greeting with the
 * signed-in name and role.
 */
export default function OverviewWelcome({ name, title }: { name: string; title: string }) {
  return (
    <div className="space-y-4">
      <nav aria-label="Website" className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <Link href="/" aria-label="Career Bridge.Studio home"><BrandLogo className="h-9 w-auto" /></Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm font-semibold">
          {SITE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} target="_blank" className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">{link.label}</Link>
            </li>
          ))}
          <li><span aria-current="page" className="rounded-full bg-[#111827] px-3 py-1.5 text-[#FACC15]">Dashboard</span></li>
        </ul>
      </nav>

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
