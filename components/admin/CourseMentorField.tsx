'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { fieldClass } from './AdminModal';

type Mentor = { id: string; name: string; email: string; level: 'lead' | 'assistant' };
type Loaded = { mentors: Mentor[]; assigned: Record<string, string>; ready: boolean };

/** Mentor accounts and which mentor each course has (admin only). */
function useMentors() {
  const [state, setState] = useState<Loaded>({ mentors: [], assigned: {}, ready: false });
  const load = useCallback(() => {
    fetch('/api/admin/accounts', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const mentors = (data?.profiles || [])
          .filter((profile: { roles?: string[]; disabled?: boolean }) => profile.roles?.includes('Instructor') && !profile.disabled)
          .map((profile: { id: string; name: string; email: string; mentor_level?: 'lead' | 'assistant' }) => ({ id: profile.id, name: profile.name, email: profile.email, level: profile.mentor_level || 'lead' }));
        const assigned = Object.fromEntries((data?.courses || []).map((row: { course_id: string; mentor_email?: string }) => [row.course_id, row.mentor_email || '']));
        setState({ mentors, assigned, ready: true });
      })
      .catch(() => setState({ mentors: [], assigned: {}, ready: true }));
  }, []);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

const optionLabel = (mentor: Mentor) => `${mentor.name} · ${mentor.level === 'lead' ? 'Lead' : 'Assistant'} · ${mentor.email}`;

/** Saves the mentor of a course; an empty email removes the mentor. */
export async function saveCourseMentor(courseId: string, mentorEmail: string) {
  const res = await fetch('/api/admin/accounts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mentorEmail ? { courseId, mentorEmail } : { courseId, action: 'unassign' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save the mentor.');
}

/** Mentor dropdown for the "New Course" form: the choice is saved after the course is created. */
export function CourseMentorSelect({ value, onChange }: { value: string; onChange: (email: string) => void }) {
  const { mentors, ready } = useMentors();
  return (
    <div>
      <label htmlFor="new-course-mentor" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Course mentor</label>
      <select id="new-course-mentor" value={value} onChange={(e) => onChange(e.target.value)} disabled={!ready} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#111827] focus:outline-none">
        <option value="">{ready ? 'No mentor yet' : 'Loading mentors…'}</option>
        {mentors.map((mentor) => <option key={mentor.id} value={mentor.email}>{optionLabel(mentor)}</option>)}
      </select>
      {ready && mentors.length === 0 && <p className="mt-1 text-[11px] text-slate-500">No mentor accounts yet. Add one in Accounts, then choose it here or in the course workspace.</p>}
    </div>
  );
}

/** Course workspace → Mentor: shows the current mentor and changes or removes them. */
export default function CourseMentorCard({ courseId }: { courseId: string }) {
  const { mentors, assigned, ready, reload } = useMentors();
  const current = (assigned[courseId] || '').toLowerCase();
  const [picked, setPicked] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPicked(current); }, [current]);

  const mentor = mentors.find((item) => item.email.toLowerCase() === current);
  const save = async (email: string) => {
    setBusy(true);
    try {
      await saveCourseMentor(courseId, email);
      toast.success(email ? 'Mentor saved for this course.' : 'Mentor removed from this course.');
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the mentor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><UserRound className="h-6 w-6" /></span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Current mentor</p>
          {!ready ? <p className="text-sm text-slate-500">Loading…</p>
            : mentor ? <><p className="truncate font-display text-lg font-extrabold">{mentor.name}</p><p className="truncate text-xs text-slate-500">{mentor.level === 'lead' ? 'Lead mentor' : 'Assistant mentor'} · {mentor.email}</p></>
            : current ? <p className="truncate text-sm font-bold">{current}</p>
            : <p className="text-sm font-bold text-slate-700">No mentor on this course yet</p>}
        </div>
      </div>

      <label className="block space-y-1 text-xs font-bold text-slate-500">
        Choose a mentor
        <select value={picked} onChange={(e) => setPicked(e.target.value)} disabled={!ready || busy} className={fieldClass}>
          <option value="">No mentor</option>
          {mentors.map((item) => <option key={item.id} value={item.email.toLowerCase()}>{optionLabel(item)}</option>)}
        </select>
      </label>
      {ready && mentors.length === 0 && <p className="text-xs text-slate-500">No mentor accounts yet. Create one in the Accounts tab first.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !ready || picked === current} onClick={() => save(picked)} className="rounded-full bg-[#111827] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save mentor'}</button>
        {current && <button type="button" disabled={busy} onClick={() => save('')} className="rounded-full border border-rose-200 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Remove mentor</button>}
      </div>
      <p className="text-xs leading-relaxed text-slate-500">The mentor sees this course in the instructor panel and can manage its lessons, quizzes, assignments and exams. Mentor accounts and their level are managed in Accounts.</p>
    </section>
  );
}
