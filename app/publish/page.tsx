'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { featuredCourses } from '@/lib/data';

type Visibility = 'published' | 'hidden' | 'archived';
type Settings = {
  course_id: string;
  visibility: Visibility;
  approval: 'none' | 'pending' | 'approved';
  discount: number;
  mentor_email: string;
  mentor_history: { email: string; at: string }[];
};

const blank = (id: string): Settings => ({
  course_id: id,
  visibility: 'published',
  approval: 'none',
  discount: 0,
  mentor_email: '',
  mentor_history: [],
});

export default function PublishPage() {
  const [settings, setSettings] = useState<Record<string, Settings>>({});
  const [level, setLevel] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const data = await fetch('/api/courses/settings').then((res) => res.json()).catch(() => ({}));
    setSettings(data.settings || {});
    setLevel(data.level || null);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (courseId: string, patch: Partial<Settings>) => {
    setNote('');
    const res = await fetch('/api/courses/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, ...patch }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setNote(data.message || 'Could not save.');
    load();
  };

  const assistant = level === 'assistant';

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Publish and archive</h1>
        <WorkspaceLinks />
        {loaded && !level && (
          <p className="bg-white rounded-3xl border border-slate-200 p-6 text-sm">
            Only mentors and admins can manage courses. Sign in with a mentor account.
          </p>
        )}
        {level && (
          <>
            <p className="text-sm text-slate-600">
              Your level: <span className="font-bold">{level}</span>.{' '}
              {assistant ? 'Assistant mentors can send a course for approval but cannot approve, publish, or change discounts.' : 'You can approve, publish, and set discounts.'}
            </p>
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <section className="space-y-3">
              {featuredCourses.map((course) => {
                const id = String(course.id);
                const row = settings[id] || blank(id);
                const discount = discounts[id] ?? row.discount;
                return (
                  <article key={id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div>
                      <p className="font-bold">{course.title}</p>
                      <p className="text-xs text-slate-500">
                        Now: {row.visibility} · approval {row.approval} · discount {row.discount}% · mentor {row.mentor_email || 'none'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100" onClick={() => change(id, { approval: 'pending' })}>
                        Send for approval
                      </button>
                      <button
                        type="button"
                        className="text-xs font-bold px-3 py-2 rounded-full bg-[#FACC15] disabled:opacity-40"
                        disabled={assistant}
                        onClick={() => change(id, { approval: 'approved' })}
                      >
                        Approve
                      </button>
                      {(['published', 'hidden', 'archived'] as Visibility[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 disabled:opacity-40"
                          disabled={assistant || (value === 'published' && row.approval === 'pending')}
                          onClick={() => change(id, { visibility: value })}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <form
                      className="flex flex-wrap gap-2 items-center"
                      onSubmit={(e) => {
                        e.preventDefault();
                        change(id, { discount });
                      }}
                    >
                      <input
                        type="number"
                        min={0}
                        max={90}
                        value={discount}
                        disabled={assistant}
                        onChange={(e) => setDiscounts((all) => ({ ...all, [id]: Number(e.target.value) }))}
                        className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <button disabled={assistant} className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 disabled:opacity-40">
                        Save discount
                      </button>
                    </form>
                    {row.mentor_history.length > 0 && (
                      <p className="text-xs text-slate-500">Mentor history: {row.mentor_history.map((item) => item.email).join(', ')}</p>
                    )}
                  </article>
                );
              })}
            </section>
          </>
        )}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-sm">
          <h2 className="font-bold">Mentors, levels, and accounts</h2>
          <p className="text-sm text-slate-600">
            The admin assigns course mentors, sets lead or assistant, and turns accounts off in the admin panel under{' '}
            <Link href="/admin" className="font-bold underline">Accounts</Link>.
          </p>
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
