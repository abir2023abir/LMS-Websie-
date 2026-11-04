'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Award, BarChart3, BookOpen, Check, ClipboardList, CreditCard, FileText, Globe, GraduationCap,
  HelpCircle, Inbox, LayoutDashboard, Lock, MessageSquare, RotateCcw, Search, ShieldCheck, TrendingUp,
  Users, Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PANEL_TABS, type PanelTab } from '@/lib/panel-tabs';

type Profile = { id: string; email: string; name: string; roles?: string[]; mentor_level?: string; disabled?: boolean };
type Access = Record<string, PanelTab[]>;

type Tool = { tab: PanelTab; label: string; icon: LucideIcon; hint: string; sensitive?: boolean };
type Group = { name: string; tone: string; tools: Tool[] };

// Columns of the matrix, grouped by what the instructor would be doing.
const GROUPS: Group[] = [
  {
    name: 'Teaching',
    tone: 'bg-amber-50 text-amber-800',
    tools: [
      { tab: 'Courses', label: 'Courses', icon: BookOpen, hint: 'Build and edit course lessons' },
      { tab: 'Quizzes', label: 'Quizzes', icon: HelpCircle, hint: 'Lesson quizzes and results' },
      { tab: 'Assignments', label: 'Assign.', icon: ClipboardList, hint: 'Assignments and grading' },
      { tab: 'Exams', label: 'Exams', icon: FileText, hint: 'Timed exams and results' },
      { tab: 'Live Classes', label: 'Live', icon: Video, hint: 'Schedule live classes, mark attendance' },
      { tab: 'Progress', label: 'Progress', icon: TrendingUp, hint: 'Lesson requests, analytics and ranking' },
      { tab: 'Certificate', label: 'Certif.', icon: Award, hint: 'Issue certificates' },
    ],
  },
  {
    name: 'Students',
    tone: 'bg-sky-50 text-sky-800',
    tools: [
      { tab: 'Students', label: 'Students', icon: GraduationCap, hint: 'Student records and enrolments' },
      { tab: 'Messages', label: 'Messages', icon: MessageSquare, hint: 'Lesson questions from students' },
      { tab: 'Requests', label: 'Requests', icon: Inbox, hint: 'Bookings and service requests' },
    ],
  },
  {
    name: 'Business',
    tone: 'bg-rose-50 text-rose-800',
    tools: [
      { tab: 'Overview', label: 'Overview', icon: LayoutDashboard, hint: 'Dashboard totals and revenue', sensitive: true },
      { tab: 'Earnings', label: 'Earnings', icon: BarChart3, hint: 'Earnings ledger', sensitive: true },
      { tab: 'Payments', label: 'Payments', icon: CreditCard, hint: 'Payment methods and approvals', sensitive: true },
      { tab: 'Accounts', label: 'Accounts', icon: Users, hint: 'User accounts and mentors', sensitive: true },
      { tab: 'Landing Page CMS', label: 'Website', icon: Globe, hint: 'Edit the public website', sensitive: true },
    ],
  },
];

const TOOLS = GROUPS.flatMap((group) => group.tools);
const TEACHING = GROUPS[0].tools.map((tool) => tool.tab);
const PRESETS: { name: string; tabs: PanelTab[] }[] = [
  { name: 'No access', tabs: [] },
  { name: 'Teacher', tabs: ['Courses', 'Quizzes', 'Assignments', 'Exams', 'Live Classes', 'Progress', 'Messages'] },
  { name: 'Teacher + students', tabs: [...TEACHING, 'Students', 'Messages', 'Requests'] },
  { name: 'Everything', tabs: [...PANEL_TABS] },
  // The client's roles. A Teaching Assistant is an Assistant mentor (set in Accounts): the tools open, but view and reply only.
  { name: 'Creator', tabs: ['Courses'] },
  { name: 'Content Publisher', tabs: ['Landing Page CMS'] },
  { name: 'Instructor / Mentor', tabs: ['Quizzes', 'Assignments', 'Exams', 'Live Classes', 'Progress', 'Students', 'Messages', 'Requests'] },
  { name: 'Teaching Assistant', tabs: ['Quizzes', 'Assignments', 'Exams', 'Progress', 'Students', 'Messages'] },
  { name: 'Client Services Manager', tabs: ['Requests', 'Messages'] },
];

const sameSet = (a: PanelTab[], b: PanelTab[]) => a.length === b.length && a.every((tab) => b.includes(tab));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';

export default function InstructorAccess() {
  const [people, setPeople] = useState<Profile[]>([]);
  const [saved, setSaved] = useState<Access>({});
  const [draft, setDraft] = useState<Access>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/accounts').then((res) => res.json()),
      fetch('/api/admin/instructor-access').then((res) => res.json()),
    ]).then(([accounts, access]) => {
      setPeople((accounts.profiles || []).filter((item: Profile) => item.roles?.includes('Instructor')));
      setSaved(access.access || {});
      setDraft(access.access || {});
    }).catch(() => toast.error('Could not load instructors'))
      .finally(() => setLoading(false));
  }, []);

  const tabsOf = (email: string) => draft[email.toLowerCase()] || [];
  const setTabs = (email: string, tabs: PanelTab[]) =>
    setDraft((prev) => ({ ...prev, [email.toLowerCase()]: PANEL_TABS.filter((tab) => tabs.includes(tab)) }));

  const toggleCell = (email: string, tab: PanelTab) => {
    const tabs = tabsOf(email);
    setTabs(email, tabs.includes(tab) ? tabs.filter((item) => item !== tab) : [...tabs, tab]);
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? people.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(q)) : people;
  }, [people, query]);

  // Column header: turn a tool on for every shown instructor, or off if all already have it.
  const toggleColumn = (tab: PanelTab) => {
    const allOn = shown.length > 0 && shown.every((p) => tabsOf(p.email).includes(tab));
    setDraft((prev) => {
      const next = { ...prev };
      for (const p of shown) {
        const key = p.email.toLowerCase();
        const tabs = next[key] || [];
        next[key] = allOn ? tabs.filter((item) => item !== tab) : PANEL_TABS.filter((item) => item === tab || tabs.includes(item));
      }
      return next;
    });
  };

  const changed = people.filter((p) => !sameSet(tabsOf(p.email), saved[p.email.toLowerCase()] || []));
  const isChanged = (email: string, tab: PanelTab) =>
    tabsOf(email).includes(tab) !== (saved[email.toLowerCase()] || []).includes(tab);

  const saveAll = async () => {
    if (changed.length === 0) return;
    setBusy(true);
    const results = await Promise.all(changed.map(async (p) => {
      const res = await fetch('/api/admin/instructor-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, tabs: tabsOf(p.email) }),
      });
      const data = await res.json().catch(() => ({}));
      return { email: p.email.toLowerCase(), ok: res.ok && data.success, tabs: data.tabs as PanelTab[] | undefined, message: data.message };
    }));
    setBusy(false);
    const failed = results.filter((r) => !r.ok);
    setSaved((prev) => {
      const next = { ...prev };
      for (const r of results) if (r.ok) next[r.email] = r.tabs || [];
      return next;
    });
    if (failed.length) toast.error(failed[0].message || `Could not save ${failed.length} instructor(s)`);
    else toast.success(`Access saved for ${results.length} instructor${results.length === 1 ? '' : 's'}`);
  };

  if (loading) return <div className="h-64 animate-pulse rounded-3xl bg-white" />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">Instructor access</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Each row is an instructor, each column a tool in their panel. Click a square to turn that tool on or off, or click a column name to set it for everyone shown.</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search instructors" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#111827]" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#111827] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>Can open</span>
          <span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded-md border-2 border-dashed border-slate-300" />Hidden</span>
          <span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded-md bg-[#FACC15] ring-2 ring-[#FACC15]/40" />Not saved yet</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-rose-500" />Business data, give carefully</span>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No instructor accounts yet. Open the Accounts tab and use Add instructor, then come back here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                {/* Group row */}
                <tr>
                  <th className="sticky left-0 z-20 bg-white" />
                  {GROUPS.map((group) => (
                    <th key={group.name} colSpan={group.tools.length} className="border-l border-slate-100 px-1 pb-1 pt-4">
                      <span className={`block rounded-lg py-1 text-[11px] font-extrabold uppercase tracking-wider ${group.tone}`}>{group.name}</span>
                    </th>
                  ))}
                  <th className="bg-white" />
                </tr>
                {/* Tool row */}
                <tr>
                  <th className="sticky left-0 z-20 min-w-[200px] border-b border-slate-200 bg-white px-4 pb-3 text-left align-bottom text-xs font-bold uppercase tracking-wider text-slate-400">
                    Instructor
                  </th>
                  {GROUPS.map((group) => group.tools.map((tool, index) => {
                    const Icon = tool.icon;
                    const count = shown.filter((p) => tabsOf(p.email).includes(tool.tab)).length;
                    return (
                      <th key={tool.tab} className={`border-b border-slate-200 px-1 pb-3 align-bottom ${index === 0 ? 'border-l border-l-slate-100' : ''}`}>
                        <button
                          type="button"
                          onClick={() => toggleColumn(tool.tab)}
                          title={`${tool.hint}. Click to switch for everyone shown.`}
                          className="group mx-auto flex w-[54px] flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition hover:bg-slate-50"
                        >
                          <span className="relative">
                            <Icon className="h-4 w-4 text-slate-500 group-hover:text-[#111827]" />
                            {tool.sensitive && <Lock className="absolute -right-2.5 -top-1.5 h-3 w-3 text-rose-500" />}
                          </span>
                          <span className="text-[11px] font-bold leading-tight text-slate-700">{tool.label}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{count}/{shown.length}</span>
                        </button>
                      </th>
                    );
                  }))}
                  <th className="border-b border-slate-200 px-4 pb-3 text-left align-bottom text-xs font-bold uppercase tracking-wider text-slate-400">Quick set</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((person) => {
                  const tabs = tabsOf(person.email);
                  const preset = PRESETS.find((p) => sameSet(p.tabs, tabs));
                  const rowChanged = changed.some((p) => p.email === person.email);
                  return (
                    <tr key={person.id} className="group/row">
                      <td className={`sticky left-0 z-10 border-b border-slate-100 px-4 py-3 shadow-[1px_0_0_#f1f5f9] group-hover/row:bg-slate-50 ${rowChanged ? 'bg-amber-50/60' : 'bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-extrabold text-[#FACC15]">{initials(person.name)}</span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {person.name}
                              {person.disabled && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Off</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500">{person.email}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full bg-[#111827]" style={{ width: `${(tabs.length / TOOLS.length) * 100}%` }} />
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">{tabs.length}/{TOOLS.length}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {GROUPS.map((group) => group.tools.map((tool, index) => {
                        const on = tabs.includes(tool.tab);
                        const dirty = isChanged(person.email, tool.tab);
                        return (
                          <td key={tool.tab} className={`border-b border-slate-100 px-1 py-3 text-center group-hover/row:bg-slate-50 ${index === 0 ? 'border-l border-l-slate-100' : ''}`}>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={on}
                              aria-label={`${tool.tab} for ${person.name}`}
                              title={`${tool.hint} — ${on ? 'can open' : 'hidden'}`}
                              onClick={() => toggleCell(person.email, tool.tab)}
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-90 ${
                                on
                                  ? tool.sensitive ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700' : 'bg-[#111827] text-white shadow-sm hover:bg-black'
                                  : 'border-2 border-dashed border-slate-200 text-transparent hover:border-slate-400 hover:text-slate-300'
                              } ${dirty ? 'ring-2 ring-[#FACC15] ring-offset-1' : ''}`}
                            >
                              <Check className="h-4 w-4" strokeWidth={3} />
                            </button>
                          </td>
                        );
                      }))}
                      <td className="border-b border-slate-100 px-4 py-3 group-hover/row:bg-slate-50">
                        <select
                          value={preset?.name || ''}
                          onChange={(e) => {
                            const picked = PRESETS.find((p) => p.name === e.target.value);
                            if (picked) setTabs(person.email, picked.tabs);
                          }}
                          className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          {!preset && <option value="">Custom</option>}
                          {PRESETS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr><td colSpan={TOOLS.length + 2} className="px-4 py-8 text-center text-sm text-slate-500">No instructor matches “{query}”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save bar */}
      {changed.length > 0 && (
        <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#111827] px-5 py-3 text-white shadow-xl">
          <p className="text-sm">
            <span className="font-bold text-[#FACC15]">{changed.length}</span> instructor{changed.length === 1 ? '' : 's'} with unsaved changes
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft(saved)} disabled={busy} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-50">
              <RotateCcw className="h-3.5 w-3.5" />Discard
            </button>
            <button type="button" onClick={saveAll} disabled={busy} className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-5 py-2 text-xs font-extrabold text-[#111827] disabled:opacity-60">
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
