'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award, BookOpen, Bookmark, CalendarDays, FileText, GraduationCap, HelpCircle, Home, LayoutDashboard, Library, LogOut, Mail, Menu,
  MessageSquare, Sparkles, TrendingUp, X, type LucideIcon,
} from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import InboxButton from '@/components/inbox/InboxButton';
import { useAuth } from '@/context/AuthContext';

/** Key of each sidebar entry; pages pass the one they show. */
export type StudentNavKey = 'overview' | 'courses' | 'quizzes' | 'assignments' | 'exams' | 'calendar' | 'progress' | 'certificates' | 'messages';

type Item = { key: string; label: string; href: string; icon: LucideIcon };

const LEARNING: Item[] = [
  { key: 'overview', label: 'Overview', href: '/student', icon: LayoutDashboard },
  { key: 'courses', label: 'My Courses', href: '/student?tab=courses', icon: BookOpen },
  { key: 'quizzes', label: 'Quizzes', href: '/student/quizzes', icon: HelpCircle },
  { key: 'assignments', label: 'Assignments', href: '/student/assignments', icon: FileText },
  { key: 'exams', label: 'Exams', href: '/exams', icon: GraduationCap },
  { key: 'calendar', label: 'Calendar', href: '/student?tab=calendar', icon: CalendarDays },
  { key: 'progress', label: 'My Progress', href: '/student?tab=progress', icon: TrendingUp },
  { key: 'certificates', label: 'Certificates', href: '/student?tab=certificates', icon: Award },
  { key: 'messages', label: 'Messages', href: '/student?tab=messages', icon: MessageSquare },
];

// The website's own pages stay one click away from the panel.
const WEBSITE: Item[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'all-courses', label: 'All Courses', href: '/courses', icon: Library },
  { key: 'bookkeeping', label: 'Bookkeeping', href: '/bookkeeping', icon: Bookmark },
  { key: 'contact', label: 'Contact', href: '/contact', icon: Mail },
];

/** The student panel frame: a sidebar like the admin and instructor panels, and a top bar. */
export default function StudentShell({ active, title, children }: { active: StudentNavKey; title: string; children: React.ReactNode }) {
  const { userProfile, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = userProfile?.name || user?.displayName || 'Learner';

  const link = (item: Item, current: boolean) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.key}
        href={item.href}
        // Close the drawer after moving to another part on a phone.
        onClick={() => setMenuOpen(false)}
        aria-current={current ? 'page' : undefined}
        className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${current ? 'bg-[#FACC15] text-[#111827] shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${current ? 'bg-[#111827] text-[#FACC15]' : 'bg-white/10 text-slate-300'}`}><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] font-sans text-slate-900 lg:flex">
      {menuOpen && <div className="fixed inset-0 z-40 bg-[#0b1220]/60 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] shrink-0 flex-col bg-[#0c1222] text-white shadow-2xl shadow-black/30 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 bg-gradient-to-br from-[#172033] to-[#0c1222] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href="/" aria-label="Career Bridge.Studio home"><BrandLogo className="h-12 w-auto" /></Link>
              <p className="mt-3 font-display text-sm font-extrabold tracking-tight text-white">Student</p>
              <p className="truncate text-[11px] font-medium text-slate-400">{name}</p>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav aria-label="Student panel" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Learning</p>
            {LEARNING.map((item) => link(item, item.key === active))}
          </div>
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500">Website</p>
            {WEBSITE.map((item) => link(item, false))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={logout} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-300">
            <LogOut className="h-4 w-4" /><span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#111827]/10 bg-[#fffdf8]/90 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Student panel</p>
            {/* Keyed so the title is drawn afresh (the language switch rewrites text in place). */}
            <h1 key={title} className="truncate font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          </div>
          <InboxButton scope="own" />
          <Link href="/courses" className="hidden min-h-10 items-center gap-2 rounded-full bg-[#111827] px-4 text-xs font-extrabold text-white transition hover:bg-black sm:inline-flex">
            <Sparkles className="h-4 w-4 text-[#FACC15]" /> Explore Courses
          </Link>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
