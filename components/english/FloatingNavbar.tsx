'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
 */
export default function FloatingNavbar({ items }: { items?: NavItem[] } = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 mx-auto w-full max-w-6xl px-3 sm:px-4">
      <div className="flex items-center justify-between gap-4 rounded-full border-2 border-[#D4AF37] bg-white px-4 py-2 shadow-lg shadow-black/10 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center group" aria-label="Career Bridge Studio home">
          <BrandLogo className="h-14 w-auto max-w-[13rem] transition-transform group-hover:scale-105" />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => {
            const current = isCurrent(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  current ? 'text-[#111827]' : 'text-slate-600 hover:bg-slate-100 hover:text-[#111827]'
                }`}
              >
                {item.name}
                {current && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-[#EAB308]" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        {/* Right: Dashboard after sign-in, Log In before. */}
        <div className="hidden shrink-0 items-center sm:flex">
          <Link
            href={accountHref}
            className="group flex items-center rounded-full bg-[#FACC15] py-1.5 pl-4 pr-1.5 text-sm font-bold text-[#111827] shadow-sm transition-colors hover:bg-[#EAB308]"
          >
            <span>{user ? 'Dashboard' : 'Log In'}</span>
            <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#111827]">
              {user ? <LayoutDashboard className="h-3.5 w-3.5 text-[#FACC15]" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5 text-[#FACC15]" aria-hidden="true" />}
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#FACC15] p-2 text-[#111827] lg:hidden"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 max-h-[calc(100dvh-5rem)] space-y-1 overflow-y-auto overscroll-contain rounded-3xl border-2 border-[#D4AF37] bg-white p-4 text-[#111827] shadow-2xl lg:hidden"
          >
            {navItems.map((item) => {
              const current = isCurrent(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold ${current ? 'bg-[#FEF9C3] text-[#111827]' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                href={accountHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 w-full items-center justify-between rounded-full bg-[#FACC15] px-4 text-sm font-bold text-[#111827]"
              >
                <span>{user ? 'Dashboard' : 'Log In'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!user && (
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-between rounded-full border border-slate-200 px-4 text-sm font-bold text-[#111827]"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
