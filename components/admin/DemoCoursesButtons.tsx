'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Sparkles, Trash2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());

/** Adds or removes the sample courses used to show the client how a full course works. */
export default function DemoCoursesButtons({ onChanged }: { onChanged: () => void }) {
  const { data, mutate } = useSWR('/api/admin/demo-courses', fetcher);
  const [busy, setBusy] = useState<'add' | 'remove' | null>(null);
  const [error, setError] = useState('');
  const installed = Number(data?.installed) || 0;

  const run = async (action: 'add' | 'remove') => {
    const question = action === 'add'
      ? 'Add the demo courses? Students and visitors will see them, marked "DEMO". Running this again resets them.'
      : 'Remove the demo courses with their quizzes, assignments, exams, live classes, discussion and reviews?';
    if (!confirm(question)) return;
    setBusy(action);
    setError('');
    try {
      const res = await fetch('/api/admin/demo-courses', { method: action === 'add' ? 'POST' : 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Could not update the demo courses.');
    } catch (err: any) {
      setError(err.message || 'Could not update the demo courses.');
    } finally {
      setBusy(null);
      void mutate();
      onChanged();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => run('add')} disabled={busy !== null} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#111827] hover:bg-slate-100 disabled:opacity-50">
        <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
        <span>{busy === 'add' ? 'Adding demo courses…' : installed ? 'Reset demo courses' : 'Add demo courses'}</span>
      </button>
      {installed > 0 && (
        <button type="button" onClick={() => run('remove')} disabled={busy !== null} className="flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{busy === 'remove' ? 'Removing…' : 'Remove demo courses'}</span>
        </button>
      )}
      {error && <p role="alert" className="w-full text-xs font-semibold text-rose-700">{error}</p>}
    </div>
  );
}
