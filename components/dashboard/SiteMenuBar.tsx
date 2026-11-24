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
      <ul className="flex flex-wrap items-center gap-1 text-sm font-semibold">
        {SITE_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
