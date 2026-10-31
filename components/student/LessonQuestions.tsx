'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

type Note = { id: string; from: 'sender' | 'admin' | 'instructor'; text: string; at: string };
type Thread = { id: string; status: 'open' | 'replied'; createdAt: string; messages: Note[]; lessonTitle: string };

type Props = {
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  studentName: string;
  studentEmail: string;
  rank: number;
  rankTotal: number;
  progress: number;
};

const when = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/** Questions this student asked about the current lesson, with the instructor's replies. */
export default function LessonQuestions(props: Props) {
  const { courseId, lessonId, studentEmail } = props;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [sending, setSending] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?mine=1&courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' });
      const data = await res.json();
      setThreads(res.ok ? data.threads || [] : []);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => { setLoading(true); void load(); }, [load]);

  const ask = async () => {
    const text = question.trim();
    if (!text) return;
    setSending('new');
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'student',
          name: props.studentName,
          email: studentEmail,
          text,
          courseId,
          courseTitle: props.courseTitle,
          moduleTitle: props.moduleTitle,
          lessonId,
          lessonTitle: props.lessonTitle,
          rank: props.rank,
          rankTotal: props.rankTotal,
          progress: props.progress,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send your question.');
      setQuestion('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your question.');
    } finally {
      setSending('');
    }
  };

  const followUp = async (id: string) => {
    const text = (followUps[id] || '').trim();
    if (!text) return;
    setSending(id);
    setError('');
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, email: studentEmail, text }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send.');
      setFollowUps((prev) => ({ ...prev, [id]: '' }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send.');
    } finally {
      setSending('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label htmlFor="lesson-question" className="block text-sm font-bold text-[#111827]">Ask your instructor about this lesson</label>
        <textarea
          id="lesson-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder={`Your question about "${props.lessonTitle}"…`}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">Your instructor sees this lesson and your progress with the question.</p>
          <button type="button" onClick={ask} disabled={!question.trim() || sending === 'new'} className="inline-flex items-center gap-1.5 rounded-full bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-50">
            <Send className="h-3.5 w-3.5" />{sending === 'new' ? 'Sending…' : 'Send question'}
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-500">Loading your questions…</p>
      ) : threads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          <MessageSquare className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          No questions about this lesson yet.
        </div>
      ) : threads.map((thread) => (
        <div key={thread.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className={`rounded-full px-2 py-0.5 font-bold ${thread.status === 'replied' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
              {thread.status === 'replied' ? 'Answered' : 'Waiting for reply'}
            </span>
            <span className="text-slate-400">{when(thread.createdAt)}</span>
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
          <div className="flex gap-2">
            <input
              value={followUps[thread.id] || ''}
              onChange={(e) => setFollowUps((prev) => ({ ...prev, [thread.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void followUp(thread.id); } }}
              placeholder="Write a follow-up…"
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
            <button type="button" onClick={() => followUp(thread.id)} disabled={!(followUps[thread.id] || '').trim() || sending === thread.id} className="rounded-full bg-[#111827] px-3 text-white disabled:opacity-40" aria-label="Send follow-up">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
