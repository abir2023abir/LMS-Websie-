'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, UploadCloud } from 'lucide-react';

/** "Publish Course": shows whether visitors can see the course, and changes it. */
export default function CoursePublishButton({ courseId }: { courseId: string }) {
  const [published, setPublished] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/courses/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        setPublished((data.settings?.[courseId]?.visibility || 'published') === 'published');
        // Assistant mentors cannot publish or hide; the server refuses it too.
        setLocked(data.level === 'assistant');
      })
      .catch(() => setPublished(null));
  }, [courseId]);

  if (published === null) return null;

  const change = async () => {
    if (published && !confirm('Unpublish this course? Visitors will not see it and nobody new can enroll. Enrolled students keep their classroom.')) return;
    setBusy(true);
    try {
      const res = await fetch('/api/courses/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, visibility: published ? 'hidden' : 'published' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Could not change the status.');
      setPublished(!published);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not change the status.');
    } finally {
      setBusy(false);
    }
  };

  if (published) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 text-xs font-bold text-emerald-300 sm:inline-flex"><CheckCircle2 className="h-4 w-4" />Published</span>
        {!locked && <button type="button" onClick={change} disabled={busy} className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50">{busy ? 'Saving…' : 'Unpublish'}</button>}
      </div>
    );
  }
  if (locked) return <span className="shrink-0 text-xs font-bold text-slate-300">Not published</span>;
  return (
    <button type="button" onClick={change} disabled={busy} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-xs font-extrabold text-white transition hover:bg-emerald-600 disabled:opacity-50">
      <UploadCloud className="h-4 w-4" />{busy ? 'Publishing…' : 'Publish Course'}
    </button>
  );
}
