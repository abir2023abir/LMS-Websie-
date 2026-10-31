'use client';

import { useState } from 'react';
import {
  BarChart3, BookOpen, CalendarDays, CalendarClock, ExternalLink, Home, Inbox, Info, MessageSquareQuote, Sparkles, Trophy, type LucideIcon,
} from 'lucide-react';
import OrientationProgrammesManager from './OrientationProgrammesManager';
import HeroEditor from './cms/HeroEditor';
import AboutEditor from './cms/AboutEditor';
import SuccessStoriesEditor from './cms/SuccessStoriesEditor';
import FeaturesEditor from './cms/FeaturesEditor';
import BlogEditor from './cms/BlogEditor';
import EnquiriesEditor from './cms/EnquiriesEditor';
import ReviewsEditor from './cms/ReviewsEditor';
import BookkeepingPageEditor from './BookkeepingPageEditor';
import ContactBookingEditor from './ContactBookingEditor';

type Section = { id: string; name: string; icon: LucideIcon; description: string; preview?: string };

const groups: { label: string; sections: Section[] }[] = [
  {
    label: 'Home page',
    sections: [
      { id: 'hero', name: 'Hero', icon: Home, description: 'The first screen visitors see: headline, text, buttons and picture.', preview: '/' },
      { id: 'about', name: 'About', icon: Info, description: 'The "A Better Learning Journey" section with its four cards.', preview: '/' },
      { id: 'features', name: 'Why Choose Us', icon: Sparkles, description: 'The reasons to learn with Career Bridge.Studio.', preview: '/' },
      { id: 'stories', name: 'Success Stories', icon: Trophy, description: 'Real learner stories. The section stays hidden until you add one.', preview: '/' },
      { id: 'orientation', name: 'Live Programmes', icon: CalendarDays, description: 'Orientation sessions and workshops. Shown only when one is scheduled.', preview: '/' },
      { id: 'reviews', name: 'Reviews', icon: MessageSquareQuote, description: 'Verified learner reviews for "What Our Learners Say".', preview: '/' },
    ],
  },
  {
    label: 'Pages',
    sections: [
      { id: 'bookkeeping', name: 'Bookkeeping', icon: BarChart3, description: 'Bookkeeping service page: plans, prices and features.', preview: '/bookkeeping' },
      { id: 'contact-booking', name: 'Contact & Booking', icon: CalendarClock, description: 'Consultation booking form text, days and time slots.', preview: '/contact' },
    ],
  },
  {
    label: 'More',
    sections: [
      { id: 'blog', name: 'Blog', icon: BookOpen, description: 'Articles. The blog is hidden on the site until you publish real articles.' },
      { id: 'enquiries', name: 'Enquiries', icon: Inbox, description: 'Messages sent from the website contact form.' },
    ],
  },
];

const allSections = groups.flatMap((group) => group.sections);

export default function LandingPageCMS() {
  const [activeSection, setActiveSection] = useState('hero');
  const current = allSections.find((section) => section.id === activeSection) || allSections[0];
  const CurrentIcon = current.icon;

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* ── Section menu: column on desktop, scrollable chips on phones ── */}
      <nav aria-label="Website sections" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {allSections.map((section) => {
            const Icon = section.icon;
            const active = section.id === activeSection;
            return (
              <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${active ? 'border-[#FACC15] bg-[#FACC15] text-[#111827]' : 'border-slate-200 bg-white text-slate-600'}`}>
                <Icon className="h-3.5 w-3.5" />{section.name}
              </button>
            );
          })}
        </div>

        <div className="hidden space-y-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
              <div className="space-y-0.5">
                {group.sections.map((section) => {
                  const Icon = section.icon;
                  const active = section.id === activeSection;
                  return (
                    <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} aria-current={active ? 'page' : undefined} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${active ? 'bg-[#FACC15] text-[#111827]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{section.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Editor ── */}
      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3] text-[#A16207]"><CurrentIcon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-extrabold text-slate-900">{current.name}</h2>
              <p className="text-sm text-slate-500">{current.description}</p>
            </div>
          </div>
          {current.preview && (
            <a href={current.preview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900">
              View on site<ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </header>
        <div className="p-5 sm:p-6">
          {activeSection === 'hero' && <HeroEditor />}
          {activeSection === 'about' && <AboutEditor />}
          {activeSection === 'features' && <FeaturesEditor />}
          {activeSection === 'stories' && <SuccessStoriesEditor />}
          {activeSection === 'orientation' && <OrientationProgrammesManager />}
          {activeSection === 'reviews' && <ReviewsEditor />}
          {activeSection === 'bookkeeping' && <BookkeepingPageEditor />}
          {activeSection === 'contact-booking' && <ContactBookingEditor />}
          {activeSection === 'blog' && <BlogEditor />}
          {activeSection === 'enquiries' && <EnquiriesEditor />}
        </div>
      </section>
    </div>
  );
}
