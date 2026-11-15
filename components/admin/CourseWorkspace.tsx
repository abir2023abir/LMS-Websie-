'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CalendarClock, ClipboardList, UserRound, ExternalLink, FileText, GraduationCap, HelpCircle, Layers, Settings2, Video, X, type LucideIcon } from 'lucide-react';
import AdminCourseEditor from './AdminCourseEditor';
import CourseMentorCard from './CourseMentorField';

const Loading = () => <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading…</div>;
const AdminQuizzes = dynamic(() => import('./AdminQuizzes'), { loading: Loading });
const AdminAssignments = dynamic(() => import('./AdminAssignments'), { loading: Loading });
const AdminExams = dynamic(() => import('./AdminExams'), { loading: Loading });
const AdminLiveClasses = dynamic(() => import('./AdminLiveClasses'), { loading: Loading });

type TabId = 'details' | 'timeline' | 'curriculum' | 'mentor' | 'quizzes' | 'assignments' | 'exams' | 'live';
type Counts = Partial<Record<TabId, number>>;

const TABS: { id: TabId; label: string; hint: string; icon: LucideIcon; group: 'Course' | 'Assessments' | 'Classes'; panelTab?: string; adminOnly?: boolean }[] = [
  { id: 'details', label: 'Details', hint: 'Name, price, category, picture and description.', icon: Settings2, group: 'Course' },
  { id: 'curriculum', label: 'Curriculum', hint: 'Modules, lessons, overviews, notes and videos.', icon: Layers, group: 'Course' },
  { id: 'timeline', label: 'Timeline', hint: 'The four course dates and the minimum lesson time.', icon: CalendarClock, group: 'Course', adminOnly: true },
  { id: 'mentor', label: 'Mentor', hint: 'The mentor who runs this course.', icon: UserRound, group: 'Course', adminOnly: true },
  { id: 'quizzes', label: 'Quizzes', hint: 'Lesson quizzes for this course.', icon: HelpCircle, group: 'Assessments', panelTab: 'Quizzes' },
  { id: 'assignments', label: 'Assignments', hint: 'Assignments and student submissions for this course.', icon: FileText, group: 'Assessments', panelTab: 'Assignments' },
  { id: 'exams', label: 'Exams', hint: 'Lesson, module and final exams for this course.', icon: GraduationCap, group: 'Assessments', panelTab: 'Exams' },
  { id: 'live', label: 'Live Classes', hint: 'Scheduled live classes and attendance for this course.', icon: Video, group: 'Classes', panelTab: 'Live Classes' },
];

/**
 * Everything for one course on one screen: its details, curriculum and timeline, plus the
 * quizzes, assignments, exams and live classes that belong to it.
 */
export default function CourseWorkspace({
  courseId,
  title,
  thumbnail,
  category,
  isAdmin,
  allowedTabs,
  isNew = false,
  onClose,
  onSaved,
}: {
  courseId: string;
  title: string;
  thumbnail?: string;
  category?: string;
  isAdmin: boolean;
  /** Panel tabs this person may use (instructor panel); admins may use all of them. */
  allowedTabs?: string[];
  /** Opened straight after the course was created. */
  isNew?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const tabs = TABS.filter((tab) => (isAdmin || !tab.adminOnly) && (isAdmin || !tab.panelTab || !allowedTabs || allowedTabs.includes(tab.panelTab)));
  const [active, setActive] = useState<TabId>(isNew ? 'curriculum' : 'details');
  const [counts, setCounts] = useState<Counts>({});

  const loadCounts = useCallback(() => {
    const sources: [TabId, string, string][] = [
      ['quizzes', '/api/admin/quizzes', 'quizzes'],
      ['assignments', '/api/admin/assignments', 'assignments'],
      ['exams', '/api/admin/exams', 'exams'],
      ['live', '/api/admin/live-classes', 'classes'],
    ];
    sources.filter(([id]) => tabs.some((tab) => tab.id === id)).forEach(([id, url, key]) => {
      fetch(url, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const list = Array.isArray(data?.[key]) ? data[key] : [];
          setCounts((prev) => ({ ...prev, [id]: list.filter((item: { courseId?: string }) => item.courseId === courseId).length }));
        })
        .catch(() => undefined);
    });
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Counts are refreshed whenever the person moves to another part, so they follow what was just added.
  useEffect(() => { loadCounts(); }, [loadCounts, active]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]:not([data-course-workspace])')) onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [onClose]);

  const current = tabs.find((tab) => tab.id === active) || tabs[0];
  const groups = (['Course', 'Assessments', 'Classes'] as const).map((group) => ({ group, items: tabs.filter((tab) => tab.group === group) })).filter((entry) => entry.items.length);
  const editorView = active === 'details' || active === 'timeline' || active === 'curriculum' ? active : null;

  // Drawn on <body> so it always covers the whole window, whatever the panel around it does.
  return createPortal(
    <div data-course-workspace role="dialog" aria-modal="true" aria-label={`Course workspace: ${title}`} className="fixed inset-0 z-[70] flex flex-col bg-slate-100 text-slate-900">
      {/* ── Header ── */}
      <header className="shrink-0 bg-[#111827] text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="hidden h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {thumbnail && <img src={thumbnail} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FACC15]">Course workspace{category ? ` · ${category}` : ''}</p>
            <h2 className="truncate font-display text-lg font-extrabold sm:text-2xl">{title || 'Untitled course'}</h2>
          </div>
          <Link href={`/courses/${courseId}`} target="_blank" className="hidden min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-4 text-xs font-bold text-white transition hover:bg-white/10 md:inline-flex">
            <ExternalLink className="h-3.5 w-3.5" /> View course page
          </Link>
          <button type="button" onClick={onClose} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#FACC15] px-4 text-xs font-extrabold text-[#111827] transition hover:bg-[#EAB308]">
            <X className="h-4 w-4" /> Close
          </button>
        </div>

        {/* Small screens: the parts as a scrolling row */}
        <nav aria-label="Course parts" className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActive(tab.id)} aria-current={active === tab.id ? 'page' : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition ${active === tab.id ? 'bg-[#FACC15] text-[#111827]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              <tab.icon className="h-3.5 w-3.5" />{tab.label}{typeof counts[tab.id] === 'number' ? ` (${counts[tab.id]})` : ''}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-6 px-4 py-5 sm:px-6">
        {/* ── Side menu ── */}
        <nav aria-label="Course parts" className="hidden w-60 shrink-0 space-y-5 overflow-y-auto lg:block">
          {groups.map(({ group, items }) => (
            <div key={group} className="space-y-1.5">
              <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{group}</p>
              {items.map((tab) => {
                const on = active === tab.id;
                return (
                  <button key={tab.id} type="button" onClick={() => setActive(tab.id)} aria-current={on ? 'page' : undefined}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition ${on ? 'bg-[#111827] text-white shadow-lg shadow-slate-900/15' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${on ? 'bg-[#FACC15] text-[#111827]' : 'bg-white text-slate-500 shadow-sm'}`}><tab.icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                    {typeof counts[tab.id] === 'number' && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${on ? 'bg-white/15 text-white' : counts[tab.id] ? 'bg-[#FEF9C3] text-[#A16207]' : 'bg-slate-200 text-slate-500'}`}>{counts[tab.id]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-slate-300 p-3 text-xs leading-relaxed text-slate-500">
            <p className="flex items-center gap-1.5 font-bold text-slate-700"><ClipboardList className="h-3.5 w-3.5" /> Order inside a lesson</p>
            <p className="mt-1">Overview and video, then the quiz, then notes and the assignment, then the exam. A part you leave empty is skipped.</p>
          </div>
        </nav>

        {/* ── Working area ── */}
        <main className="min-w-0 flex-1 space-y-4 overflow-y-auto pb-10">
          {/* Keyed so the heading is drawn afresh for each part (the language switch rewrites text in place). */}
          <div key={current.id}>
            <h3 className="font-display text-xl font-extrabold">{current.label}</h3>
            <p className="text-sm text-slate-500">{current.hint}</p>
          </div>

          {isNew && active === 'curriculum' && (
            <p className="rounded-2xl border border-[#FACC15] bg-[#FEFCE8] px-4 py-3 text-sm font-medium text-slate-700">
              The course is created. Check its lessons here, then set its mentor and timeline and add its quizzes, assignments, exams and live classes from the menu.
            </p>
          )}

          {/* The editor stays mounted so unsaved typing survives a move between its three parts. */}
          <div hidden={!editorView} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <AdminCourseEditor bare view={editorView || 'details'} courseId={courseId} onClose={onClose} onSaved={onSaved} />
          </div>

          {active === 'mentor' && <CourseMentorCard courseId={courseId} />}
          {active === 'quizzes' && <AdminQuizzes courseId={courseId} />}
          {active === 'assignments' && <AdminAssignments courseId={courseId} />}
          {active === 'exams' && <AdminExams courseId={courseId} />}
          {active === 'live' && <AdminLiveClasses courseId={courseId} />}
        </main>
      </div>
    </div>,
    document.body,
  );
}
