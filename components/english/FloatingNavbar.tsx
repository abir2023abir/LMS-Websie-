'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';
import BrandLogo from '@/components/brand/BrandLogo';

type NavItem = { name: string; href: string };

const DEFAULT_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'All Courses', href: '/courses' },
  { name: 'Bookkeeping', href: '/bookkeeping' },
  { name: 'Contact', href: '/contact' },
];

/**
 * The one website menu used on every public page (client layout):
 * CAREER BRIDGE.STUDIO · Home · All Courses · Bookkeeping · Contact · Dashboard (or Log In).
 * Menu links are plain text; the current page is marked. The single yellow button is
 * Dashboard for a signed-in person, Log In for a visitor.
 * Phones show every option at once in two short rows; nothing is hidden behind a menu button.
 */
export default function FloatingNavbar({ items }: { items?: NavItem[] } = {}) {
  const { user, role } = useAuth();
  const pathname = usePathname() || '/';

  const navItems = items || DEFAULT_ITEMS;
  const isCurrent = (href: string) => {
    const path = href.split('#')[0] || '/';
    if (href.includes('#')) return false;
    return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
  };
  const accountHref = user ? homeForRole(role) : '/login';

  return (
    <header className="fixed left-0 right-0 top-2 z-50 mx-auto w-full max-w-6xl px-2 md:top-4 md:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-2 rounded-3xl border-2 border-[#D4AF37] bg-white px-2.5 py-1 shadow-lg shadow-black/10 md:flex-nowrap md:gap-x-3 md:rounded-full md:px-4 md:py-2 lg:gap-x-4 lg:px-6">
        <Link href="/" className="group flex min-w-0 items-center md:shrink-0" aria-label="Career Bridge Studio home">
          <BrandLogo className="h-9 w-auto max-w-[7.5rem] transition-transform group-hover:scale-105 md:h-12 md:max-w-[10rem] lg:h-14 lg:max-w-[13rem]" />
        </Link>

        {/* Phones: the links sit on their own row under the logo. */}
        <nav aria-label="Main" className="order-last flex w-full items-center justify-between gap-0.5 border-t border-slate-100 md:order-none md:w-auto md:flex-1 md:justify-center md:gap-1 md:border-0">
          {navItems.map((item) => {
            const current = isCurrent(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`relative flex min-h-9 items-center justify-center whitespace-nowrap rounded-full px-2 text-xs font-semibold transition-colors md:min-h-0 md:px-2.5 md:py-2 md:text-sm lg:px-4 ${
                  current ? 'text-[#111827]' : 'text-slate-600 hover:bg-slate-100 hover:text-[#111827]'
                }`}
              >
                {item.name}
                {current && <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-[#EAB308] md:-bottom-0.5 lg:inset-x-4" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Right: Dashboard after sign-in, Log In before. Phones also offer Sign Up here. */}
        <div className="flex shrink-0 items-center gap-1.5">
          {!user && (
            <Link href="/signup" className="flex min-h-9 items-center whitespace-nowrap rounded-full border border-slate-300 px-2.5 text-[11px] font-bold text-[#111827] md:hidden">
              Sign Up
            </Link>
          )}
          <Link
            href={accountHref}
            className="group flex min-h-9 items-center whitespace-nowrap rounded-full bg-[#FACC15] pl-3 pr-1 text-xs font-bold text-[#111827] shadow-sm transition-colors hover:bg-[#EAB308] md:min-h-0 md:py-1.5 md:pl-4 md:pr-1.5 md:text-sm"
          >
            <span>{user ? 'Dashboard' : 'Log In'}</span>
            <span className="ml-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] md:ml-2 md:h-7 md:w-7">
              {user ? <LayoutDashboard className="h-3.5 w-3.5 text-[#FACC15]" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5 text-[#FACC15]" aria-hidden="true" />}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
