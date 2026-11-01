'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, ChevronDown, History, Search, UserCheck, UserMinus, Users } from 'lucide-react';
import { toast } from 'sonner';

type Profile = { id: string; name: string; email: string; roles: string[]; disabled: boolean; mentor_level: 'lead' | 'assistant' };
type CourseRow = { course_id: string; mentor_email: string; mentor_history: { email: string; at: string }[] };
type OutlineCourse = { id: string; title: string };

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';
const when = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Admin → Accounts → Course mentors: one card per course with its mentor, a quick
 * change / remove control, the full assignment history and each mentor's workload.
 */
export default function CourseMentorsPanel({
  profiles,
  settings,
  onChange,
}: {
  profiles: Profile[];
  settings: CourseRow[];
  onChange: () => void;
}) {
  const [courses, setCourses] = useState<OutlineCourse[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    fetch('/api/course-outline', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setCourses((data.courses || []).map((course: OutlineCourse) => ({ id: course.id, title: course.title }))))
      .catch(() => setCourses([]));
  }, []);

  const mentors = profiles.filter((profile) => profile.roles.includes('Instructor') && !profile.disabled);
  const mentorBy = (email: string) => profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
  const rowFor = (courseId: string) => settings.find((row) => row.course_id === courseId);

  const workload = useMemo(() => mentors.map((mentor) => ({
    mentor,
    courses: courses.filter((course) => rowFor(course.id)?.mentor_email.toLowerCase() === mentor.email.toLowerCase()),
  })).sort((a, b) => b.courses.length - a.courses.length), [mentors, courses, settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const assignedCount = courses.filter((course) => rowFor(course.id)?.mentor_email).length;
  const visible = courses.filter((course) => {
    const assigned = Boolean(rowFor(course.id)?.mentor_email);
    if (filter === 'assigned' && !assigned) return false;
    if (filter === 'unassigned' && assigned) return false;
    const mentor = mentorBy(rowFor(course.id)?.mentor_email || '');
    const q = query.trim().toLowerCase();
    return !q || course.title.toLowerCase().includes(q) || mentor?.name.toLowerCase().includes(q) || rowFor(course.id)?.mentor_email.includes(q);
  });

  const send = async (body: object, success: string, key: string) => {
    setBusy(key);
    try {
      const res = await fetch('/api/admin/accounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not save.');
      toast.success(success);
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Course mentors</h2>
          <p className="text-sm text-slate-500">The mentor answers lesson questions and reviews work for that course. Changing a mentor keeps the history; grades and messages stay with the student.</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-2xl bg-emerald-50 px-4 py-2"><p className="font-display text-xl font-extrabold text-emerald-700">{assignedCount}</p><p className="text-[11px] font-semibold text-emerald-700">with mentor</p></div>
          <div className={`rounded-2xl px-4 py-2 ${courses.length - assignedCount ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500'}`}><p className="font-display text-xl font-extrabold">{courses.length - assignedCount}</p><p className="text-[11px] font-semibold">need a mentor</p></div>
        </div>
      </div>

      {/* Mentor workload */}
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500"><Users className="h-3.5 w-3.5" />Mentors ({mentors.length})</p>
        {mentors.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No mentor accounts yet. Create one under staff sign-up with the Mentor role, then assign it here.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {workload.map(({ mentor, courses: mine }) => (
              <div key={mentor.id} className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-[#FACC15]">{initials(mentor.name)}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{mentor.name}</p>
                  <p className="text-[11px] text-slate-500"><span className={`mr-1 rounded-full px-1.5 py-0.5 font-bold ${mentor.mentor_level === 'lead' ? 'bg-[#FEF9C3] text-[#A16207]' : 'bg-slate-100 text-slate-600'}`}>{mentor.mentor_level === 'lead' ? 'Lead' : 'Assistant'}</span>{mine.length} course{mine.length === 1 ? '' : 's'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search course or mentor…" className="w-full bg-transparent text-sm focus:outline-none" />
        </label>
        {(['all', 'assigned', 'unassigned'] as const).map((key) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === key ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {key === 'all' ? 'All courses' : key === 'assigned' ? 'With mentor' : 'Needs mentor'}
          </button>
        ))}
      </div>

      {/* Course cards */}
      {courses.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading courses…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">No courses match.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((course) => {
            const row = rowFor(course.id);
            const current = row?.mentor_email ? mentorBy(row.mentor_email) : undefined;
            const choice = picked[course.id] ?? '';
            const history = row?.mentor_history || [];
            return (
              <article key={course.id} className={`flex flex-col gap-3 rounded-2xl border p-4 ${row?.mentor_email ? 'border-slate-200' : 'border-amber-200 bg-amber-50/40'}`}>
                <p className="flex items-start gap-2 font-bold text-slate-900"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{course.title}</p>

                {row?.mentor_email ? (
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-[#FACC15]">{initials(current?.name || row.mentor_email)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{current?.name || 'Unknown account'}</p>
                      <p className="truncate text-xs text-slate-500">{row.mentor_email}</p>
                    </div>
                    {current && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${current.mentor_level === 'lead' ? 'bg-[#FEF9C3] text-[#A16207]' : 'bg-slate-200 text-slate-600'}`}>{current.mentor_level === 'lead' ? 'Lead' : 'Assistant'}</span>}
                    {!current && <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">Account missing</span>}
                  </div>
                ) : (
                  <p className="flex items-center gap-2 rounded-xl bg-amber-100/60 p-3 text-sm font-semibold text-amber-900"><AlertTriangle className="h-4 w-4" />No mentor — student questions for this course go to the admin only.</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <select aria-label={`Mentor for ${course.title}`} value={choice} onChange={(e) => setPicked((prev) => ({ ...prev, [course.id]: e.target.value }))} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="">{row?.mentor_email ? 'Change mentor…' : 'Choose a mentor…'}</option>
                    {mentors.filter((mentor) => mentor.email !== row?.mentor_email).map((mentor) => (
                      <option key={mentor.id} value={mentor.email}>{mentor.name} · {mentor.mentor_level === 'lead' ? 'Lead' : 'Assistant'}</option>
                    ))}
                  </select>
                  <button type="button" disabled={!choice || busy === course.id} onClick={() => send({ courseId: course.id, mentorEmail: choice }, 'Mentor assigned', course.id).then(() => setPicked((prev) => ({ ...prev, [course.id]: '' })))} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-bold text-[#111827] hover:bg-[#EAB308] disabled:opacity-40">
                    <UserCheck className="h-4 w-4" />{row?.mentor_email ? 'Change' : 'Assign'}
                  </button>
                  {row?.mentor_email && (
                    <button type="button" disabled={busy === course.id} onClick={() => { if (confirm(`Remove the mentor from "${course.title}"?`)) void send({ courseId: course.id, action: 'unassign' }, 'Mentor removed', course.id); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" title="Remove mentor">
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {history.length > 0 && (
                  <div>
                    <button type="button" onClick={() => setOpenHistory(openHistory === course.id ? null : course.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
                      <History className="h-3.5 w-3.5" />History ({history.length})
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openHistory === course.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openHistory === course.id && (
                      <ol className="mt-2 space-y-1.5 border-l-2 border-slate-200 pl-3">
                        {history.map((entry, index) => {
                          const person = entry.email ? mentorBy(entry.email) : undefined;
                          return (
                            <li key={`${entry.at}-${index}`} className="text-xs text-slate-600">
                              <span className="font-semibold text-slate-800">{entry.email ? (person?.name || entry.email) : 'Mentor removed'}</span>
                              {index === 0 && entry.email === row?.mentor_email && <span className="ml-1 rounded bg-emerald-50 px-1 text-[10px] font-bold text-emerald-700">current</span>}
                              <span className="text-slate-400"> · {when(entry.at)}</span>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
