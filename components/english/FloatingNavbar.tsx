'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';
import BrandLogo from '@/components/brand/BrandLogo';

export default function FloatingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role } = useAuth();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'All Courses', href: '/courses' },
    { name: 'Bookkeeping', href: '/bookkeeping' },
    { name: 'Contact', href: '/contact#contact' },
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 mx-auto w-full max-w-6xl px-3 sm:px-4">
      <div className="flex items-center justify-between rounded-full border-2 border-[#D4AF37] bg-white px-4 py-2 shadow-lg shadow-black/10 sm:px-6">
        <Link href="/" className="flex items-center group" aria-label="Career Bridge Studio home">
          <BrandLogo className="h-14 w-auto max-w-[13rem] transition-transform group-hover:scale-105" />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded-full border border-[#D4AF37] bg-[#FACC15] px-3.5 py-1.5 text-xs font-bold text-[#111827] transition hover:bg-[#EAB308]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ── Right: Inbox after login, then Dashboard ── */}
        <div className="hidden sm:flex items-center gap-3">
          {/* User Auth / Dashboard Button */}
          {user ? (
            <Link
              href={homeForRole(role)}
              className="group flex items-center rounded-full border-2 border-[#D4AF37] bg-[#FACC15] py-1 pl-4 pr-1 text-xs font-bold text-[#111827] transition hover:bg-[#EAB308]"
            >
              <span>Dashboard</span>
              <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#111827]">
                <LayoutDashboard className="h-3.5 w-3.5 text-[#FACC15]" />
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="group flex items-center rounded-full border-2 border-[#D4AF37] bg-[#FACC15] py-1 pl-4 pr-1 text-xs font-bold text-[#111827] transition hover:bg-[#EAB308]"
            >
              <span>Log In</span>
              <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#111827]">
                <ArrowRight className="h-3.5 w-3.5 text-[#FACC15]" />
              </div>
            </Link>
          )}
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#FACC15] p-2 text-[#111827] lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 max-h-[calc(100dvh-5rem)] space-y-3 overflow-y-auto rounded-3xl border-2 border-[#D4AF37] bg-white p-5 text-[#111827] shadow-2xl lg:hidden"
          >
            <div className="mb-4">
              <BrandLogo className="h-14 w-auto" />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center rounded-full border border-[#D4AF37] bg-[#FACC15] px-4 text-sm font-bold text-[#111827]"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-[#D4AF37]/40 pt-2">
              <Link
                href={user ? homeForRole(role) : '/login'}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-full flex items-center justify-between bg-[#FACC15] text-[#111827] font-bold text-xs py-2.5 px-4 rounded-full">
                  <span>{user ? 'My Dashboard' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
