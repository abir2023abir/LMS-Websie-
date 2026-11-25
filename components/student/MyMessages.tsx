'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

type Note = { id: string; from: 'sender' | 'admin' | 'instructor'; text: string; at: string };
type Thread = { id: string; status: 'open' | 'replied'; createdAt: string; messages: Note[]; courseTitle: string; lessonTitle: string; topic: string };

const when = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/**
 * The student's conversations with the team: questions they sent, replies, and messages the team
 * started. `courseId` limits it to one course; `refresh` reloads it after a new message is sent.
 */
export default function MyMessages({ courseId = '', email, refresh = 0 }: { courseId?: string; email: string; refresh?: number }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`/api/messages?mine=1&courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setThreads(data?.threads || []))
      .catch(() => undefined);
  }, [courseId]);
  useEffect(() => { load(); }, [load, refresh]);

  const reply = async (id: string) => {
    const text = (replies[id] || '').trim();
    if (!text) return;
    setSending(id);
    setError('');
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, email, text }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send.');
      setReplies((prev) => ({ ...prev, [id]: '' }));
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.');
    } finally {
      setSending('');
    }
  };

  if (!threads.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#111827]"><MessageSquare className="h-4 w-4 text-amber-600" />Your messages</h3>
      {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}
      {threads.map((thread) => (
        <article key={thread.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="min-w-0 truncate font-bold text-slate-600">{[thread.courseTitle, thread.lessonTitle, thread.topic].filter(Boolean).join(' · ') || 'Message'}</span>
            <span className="shrink-0 text-slate-400">{when(thread.createdAt)}</span>
          </div>
          {thread.messages.map((note) => {
            const staff = note.from !== 'sender';
            return (
              <div key={note.id} className={`flex ${staff ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${staff ? 'rounded-bl-md bg-[#111827] text-white' : 'rounded-br-md bg-[#FEF9C3] text-[#111827]'}`}>
                  <p className={`mb-0.5 text-[10px] font-bold ${staff ? 'text-[#FACC15]' : 'text-amber-700'}`}>{staff ? (note.from === 'admin' ? 'Career Bridge.Studio' : 'Instructor') : 'You'}</p>
                  <p className="whitespace-pre-wrap break-words">{note.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${staff ? 'text-white/50' : 'text-slate-400'}`}>{when(note.at)}</p>
                </div>
              </div>
            );
          })}
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void reply(thread.id); }}>
            <input aria-label="Your reply" value={replies[thread.id] || ''} onChange={(e) => setReplies((prev) => ({ ...prev, [thread.id]: e.target.value }))} placeholder="Write a reply…" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]" />
            <button type="submit" disabled={!(replies[thread.id] || '').trim() || sending === thread.id} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white disabled:opacity-40" aria-label="Send reply"><Send className="h-4 w-4" /></button>
          </form>
        </article>
      ))}
    </section>
  );
}
