'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

type Request = {
  id: string; studentName: string; studentEmail: string; courseTitle: string; lessonTitle: string; nextLessonTitle: string;
  message: string; status: 'pending' | 'approved' | 'rejected'; decidedBy: string; reply: string; createdAt: string; decidedAt: string;
};

const ago = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' });
};

/**
 * Students asking to move on from a lesson that has no live class. Shown to admins
 * (all courses) and to mentors (their own courses).
 */
export default function ProgressRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'pending' | 'done'>('pending');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');

  useEffect(() => {
    fetch('/api/progress-requests', { cache: 'no-store' }).then((res) => res.json()).then((data) => setRequests(data.requests || [])).finally(() => setLoading(false));
  }, []);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    try {
      const res = await fetch('/api/progress-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, reply: replies[id] || '' }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not save.');
      setRequests(data.requests || []);
      toast.success(status === 'approved' ? 'Next lesson opened' : 'Request declined');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy('');
    }
  };

  const pending = requests.filter((item) => item.status === 'pending');
  const list = view === 'pending' ? pending : requests.filter((item) => item.status !== 'pending');

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Next-lesson requests</h2>
          <p className="text-sm text-slate-500">When a lesson has no live class, the student asks here to move on. Approving opens their next lesson.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
          <button type="button" onClick={() => setView('pending')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${view === 'pending' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Waiting{pending.length > 0 && <span className="rounded-full bg-[#FACC15] px-1.5 text-[11px] text-[#111827]">{pending.length}</span>}</button>
          <button type="button" onClick={() => setView('done')} className={`rounded-lg px-3 py-1.5 ${view === 'done' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Decided</button>
        </div>
      </div>

      {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading…</p> : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">{view === 'pending' ? 'No one is waiting right now.' : 'No decisions yet.'}</p>
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <article key={item.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">{item.studentName} <span className="text-xs font-normal text-slate-500">{item.studentEmail}</span></p>
                  <p className="text-xs text-slate-600">{item.courseTitle} · finished <strong>{item.lessonTitle}</strong>{item.nextLessonTitle ? <> → wants <strong>{item.nextLessonTitle}</strong></> : null}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3 w-3" />{ago(item.createdAt)}</span>
              </div>
              {item.message && <p className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{item.message}</p>}
              {item.status === 'pending' ? (
                <div className="flex flex-wrap gap-2">
                  <input value={replies[item.id] || ''} onChange={(e) => setReplies((prev) => ({ ...prev, [item.id]: e.target.value }))} placeholder="Note to the student (optional)" className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <button type="button" disabled={busy === item.id} onClick={() => decide(item.id, 'approved')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Check className="h-4 w-4" />Approve</button>
                  <button type="button" disabled={busy === item.id} onClick={() => decide(item.id, 'rejected')} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><X className="h-4 w-4" />Decline</button>
                </div>
              ) : (
                <p className={`text-xs font-semibold ${item.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'}`}>{item.status === 'approved' ? 'Approved' : 'Declined'} by {item.decidedBy}{item.reply ? ` — “${item.reply}”` : ''}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
