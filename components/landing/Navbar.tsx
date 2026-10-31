'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { homeForRole } from '@/lib/roles';

export default function Navbar() {
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
      <div className="bg-[#111827]/95 backdrop-blur-md text-white rounded-full px-4 sm:px-6 py-2.5 shadow-2xl border border-white/10 flex items-center justify-between">
        {/* ── Left: Logo ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="border border-[#FACC15] px-2.5 sm:px-3 py-1 rounded-lg bg-black/40 flex flex-col items-center justify-center transition-transform group-hover:scale-105">
            <span className="font-display font-extrabold text-[10px] tracking-wider text-[#FACC15] uppercase leading-none">
              Career Bridge
            </span>
            <span className="font-display font-bold text-[8px] tracking-widest text-white uppercase leading-none mt-0.5">
              .Studio
            </span>
          </div>
        </Link>

        {/* ── Center: Nav Links ── */}
        <nav className="hidden lg:flex items-center gap-3.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-xs font-semibold text-slate-300 hover:text-[#FACC15] transition-colors py-1"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ── Right: Dashboard after login, then Login Button ── */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href={homeForRole(role)}
              className="group flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1 text-xs font-bold transition-all shadow-lg shadow-[#FACC15]/20"
            >
              <span>Dashboard</span>
              <div className="ml-2 w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#FACC15]" />
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="group flex items-center bg-[#FACC15] hover:bg-[#eab308] text-[#111827] rounded-full pl-4 pr-1 py-1 text-xs font-bold transition-all shadow-lg shadow-[#FACC15]/20"
            >
              <span>Log In</span>
              <div className="ml-2 w-6 h-6 rounded-full bg-[#111827] flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
              </div>
            </Link>
          )}
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden min-h-11 min-w-11 p-2 flex items-center justify-center text-slate-300 hover:text-white rounded-full hover:bg-white/10"
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
            className="lg:hidden mt-2 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[#111827]/98 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-3 shadow-2xl text-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="border border-[#FACC15] px-3 py-1 rounded-lg bg-black/40 flex flex-col items-center justify-center">
                <span className="font-display font-extrabold text-[10px] tracking-wider text-[#FACC15] uppercase leading-none">
                  Career Bridge
                </span>
                <span className="font-display font-bold text-[8px] tracking-widest text-white uppercase leading-none mt-0.5">
                  .Studio
                </span>
              </div>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center text-sm font-semibold text-slate-300 hover:text-[#FACC15]"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href={user ? homeForRole(role) : '/login'}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-full min-h-11 flex items-center justify-between bg-[#FACC15] text-[#111827] font-bold text-xs py-2.5 px-4 rounded-full">
                  <span>{user ? 'My Dashboard' : 'Log In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              {!user && (
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-full min-h-11 flex items-center justify-between border border-white/15 text-white font-bold text-xs py-2.5 px-4 rounded-full">
                    <span>Sign Up Free</span>
                    <ArrowRight className="w-4 h-4 text-[#FACC15]" />
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
