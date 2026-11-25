'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CourseMentorCard, { useMentors } from './CourseMentorField';
import { fieldClass } from './AdminModal';

type Dates = { firstEnrolled: string; lastEnrolled: string; lastCounting: string; courseEnding: string };
type Loaded = { dates: Dates; saved: boolean; accessDays: number; lessonsWithDays: number };

const FIELDS: { key: keyof Dates; label: string; hint: string; time: string }[] = [
  { key: 'firstEnrolled', label: 'First Enrolled', hint: 'Enrollment opens on this day.', time: '00:00:00' },
  { key: 'lastEnrolled', label: 'Last Enrolled', hint: 'Last day a new student can enroll.', time: '23:59:00' },
  { key: 'lastCounting', label: 'Last Counting', hint: 'Used to work out the minimum time for each lesson.', time: '23:59:00' },
  { key: 'courseEnding', label: 'Course Ending', hint: 'Final deadline for the course.', time: '23:59:00' },
];
const blank: Dates = { firstEnrolled: '', lastEnrolled: '', lastCounting: '', courseEnding: '' };
/** The calendar day in Bangladesh of a saved time, as the date box wants it. */
const toDay = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(date);
};
const card = 'space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6';
export const TIMELINE_CHANGED = 'cb-timeline-changed';

function DatesCard({ courseId }: { courseId: string }) {
  const [state, setState] = useState<Loaded | null>(null);
  const [form, setForm] = useState<Dates>(blank);
  const [busy, setBusy] = useState(false);
  const url = `/api/courses/timeline?courseId=${encodeURIComponent(courseId)}`;

  const load = useCallback(() => {
    fetch(url, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const saved = data.dates as Dates | null;
        const dates = saved ? (Object.fromEntries(FIELDS.map((field) => [field.key, toDay(saved[field.key])])) as Dates) : blank;
        setState({ dates, saved: Boolean(saved), accessDays: Number(data.accessDays) || 0, lessonsWithDays: Number(data.lessonsWithDays) || 0 });
        setForm(dates);
      })
      .catch(() => toast.error('Could not load the course dates.'));
  }, [url]);
  useEffect(() => { load(); }, [load]);

  const send = async (init: RequestInit, message: string, target = '/api/courses/timeline') => {
    setBusy(true);
    try {
      const res = await fetch(target, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Could not save the dates.');
      toast.success(message);
      window.dispatchEvent(new Event(TIMELINE_CHANGED));
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the dates.');
    } finally {
      setBusy(false);
    }
  };

  const complete = FIELDS.every((field) => form[field.key]);
  const save = () => {
    const body = Object.fromEntries(FIELDS.map((field) => [field.key, `${form[field.key]}T${field.time}+06:00`]));
    void send({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, ...body }) }, 'Course dates saved.');
  };

  return (
    <section className={card}>
      <div>
        <h4 className="font-display text-base font-extrabold">Enrollment and course dates</h4>
        <p className="text-sm text-slate-500">Bangladesh time. Fill all four, then save.</p>
      </div>
      {state && state.accessDays > 0 && (
        <p className="rounded-2xl border border-[#FACC15] bg-[#FEFCE8] px-4 py-3 text-sm text-slate-700">This course now runs for {state.accessDays} days from each student&apos;s enrollment (Timeline). Saving dates here replaces that course length.</p>
      )}
      {state && state.lessonsWithDays > 0 && (
        <p className="rounded-2xl border border-[#FACC15] bg-[#FEFCE8] px-4 py-3 text-sm text-slate-700">{state.lessonsWithDays} lesson{state.lessonsWithDays === 1 ? ' has its' : 's have their'} own days. While they do, student deadlines are counted in days. Clear the lesson days in Curriculum to use these dates for deadlines.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="block space-y-1 text-xs font-bold text-slate-600">
            {field.label}
            <input type="date" value={form[field.key]} disabled={!state || busy} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} className={fieldClass} />
            <span className="block text-[11px] font-medium text-slate-500">{field.hint}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!state || busy || !complete || JSON.stringify(form) === JSON.stringify(state.dates)} onClick={save} className="rounded-full bg-[#111827] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save dates'}</button>
        {state?.saved && (
          <button type="button" disabled={busy} onClick={() => { if (confirm('Remove these four dates?')) void send({ method: 'DELETE' }, 'Course dates removed.', `${url}&part=dates`); }} className="rounded-full border border-rose-200 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Remove dates</button>
        )}
      </div>
    </section>
  );
}

function AssistantCard({ courseId }: { courseId: string }) {
  const { mentors, ready } = useMentors();
  const [current, setCurrent] = useState<string | null>(null);
  const [picked, setPicked] = useState('');
  const [busy, setBusy] = useState(false);
  const assistants = mentors.filter((mentor) => mentor.level === 'assistant');

  useEffect(() => {
    fetch(`/api/courses/assistant?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => { setCurrent(data.email || ''); setPicked(data.email || ''); })
      .catch(() => setCurrent(''));
  }, [courseId]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/courses/assistant', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, email: picked }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not save the mentor assistant.');
      setCurrent(data.email);
      toast.success(data.email ? 'Mentor assistant saved for this course.' : 'Mentor assistant removed from this course.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the mentor assistant.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={card}>
      <label className="block space-y-1 text-xs font-bold text-slate-600">
        Mentor Assistant
        <select value={picked} onChange={(e) => setPicked(e.target.value)} disabled={!ready || current === null || busy} className={fieldClass}>
          <option value="">No mentor assistant</option>
          {assistants.map((item) => <option key={item.id} value={item.email.toLowerCase()}>{item.name} · {item.email}</option>)}
        </select>
      </label>
      {ready && assistants.length === 0 && <p className="text-xs text-slate-500">No assistant accounts yet. In Accounts, give an instructor the assistant level first.</p>}
      <button type="button" disabled={busy || current === null || picked === current} onClick={save} className="rounded-full bg-[#111827] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save mentor assistant'}</button>
      <p className="text-xs leading-relaxed text-slate-500">An assistant sees this course and its student messages and can reply. They cannot change the course.</p>
    </section>
  );
}

/** Course workspace → Settings: the four course dates, the mentor and the mentor assistant. */
export default function CourseSettingsPanel({ courseId, isAdmin }: { courseId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-4">
      <DatesCard courseId={courseId} />
      {isAdmin && (<><CourseMentorCard courseId={courseId} /><AssistantCard courseId={courseId} /></>)}
    </div>
  );
}
