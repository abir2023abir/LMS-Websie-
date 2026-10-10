'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap, ChevronRight, UserCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navLinks } from '@/lib/data';
import { useScrolled } from '@/hooks/useScrolled';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled(20);
  const { user, role, userProfile, logout } = useAuth();

  const dashboardLink = role === 'Instructor' ? '/dashboard/instructor' : '/student';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300 ease-in-out',
        scrolled
          ? 'glass border-b border-white/8 py-3 shadow-2xl shadow-black/40'
          : 'bg-transparent border-b border-transparent py-5'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-ring rounded-lg"
            aria-label="LearnVerse home"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary-600/40 group-hover:shadow-primary-600/60 group-hover:scale-105 transition-all duration-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Learn<span className="gradient-text">Verse</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-150 focus-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop Auth Buttons / User Profile ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardLink}>
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<LayoutDashboard className="w-4 h-4 text-primary-400" />}
                  >
                    Dashboard ({role})
                  </Button>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md" id="navbar-login-btn">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="primary"
                    size="md"
                    id="navbar-signup-btn"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Menu Toggle ── */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150 focus-ring"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileOpen ? 'max-h-[28rem] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <div className="glass rounded-2xl border border-white/8 p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-150"
              >
                <span className="font-medium">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}

            <div className="h-px bg-white/8 my-2" />

            <div className="flex flex-col gap-2 pt-1">
              {user ? (
                <>
                  <Link href={dashboardLink} onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="md" fullWidth leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      Dashboard ({role})
                    </Button>
                  </Link>
                  <Button variant="ghost" size="md" fullWidth onClick={() => { logout(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="md" fullWidth id="mobile-login-btn">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      id="mobile-signup-btn"
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
