'use client';

import Link from 'next/link';
import BrandLogo from '@/components/brand/BrandLogo';

const SITE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'All Courses', href: '/courses' },
  { label: 'Bookkeeping', href: '/bookkeeping' },
  { label: 'Contact', href: '/contact' },
];

/**
 * The website menu at the top of a dashboard (client layout):
 * CAREER BRIDGE.STUDIO · Home · All Courses · Bookkeeping · Contact.
 */
export default function SiteMenuBar() {
  return (
    <nav aria-label="Website" className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
      <Link href="/" aria-label="Career Bridge.Studio home"><BrandLogo className="h-9 w-auto" /></Link>
      <ul className="grid w-full grid-cols-2 gap-1 text-sm font-semibold sm:flex sm:w-auto sm:flex-wrap sm:items-center">
        {SITE_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="flex min-h-10 items-center justify-center rounded-full bg-slate-50 px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:min-h-0 sm:bg-transparent sm:py-1.5">{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
