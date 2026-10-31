'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarClock, Mail, Phone, Search, Send } from 'lucide-react';

type Note = { id: string; from: 'sender' | 'admin' | 'instructor'; text: string; at: string };
type Thread = {
  id: string;
  kind: 'student' | 'service';
  name: string;
  email: string;
  status: 'open' | 'replied';
  createdAt: string;
  messages: Note[];
  courseId?: string;
  courseTitle?: string;
  rank?: number;
  rankTotal?: number;
  progress?: number;
  moduleTitle?: string;
  lessonTitle?: string;
  instructorName?: string;
  phone?: string;
  topic?: string;
  billing?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  company?: string;
  monthlyRevenue?: string;
};

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';

function shortTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' });
}

const fullTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

function appointmentLine(item: Thread) {
  if (!item.appointmentDate) return '';
  const when = new Date(`${item.appointmentDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return `${when} at ${item.appointmentTime} (Bangladesh time)`;
}

export default function AdminMessages({
  listUrl = '/api/admin/messages',
  replyUrl = '/api/admin/messages',
  replyBody,
  title = 'Messages',
  intro = 'Lesson questions from students and consultation requests from the contact page.',
}: {
  listUrl?: string;
  replyUrl?: string;
  replyBody?: (id: string, text: string) => Record<string, unknown>;
  title?: string;
  intro?: string;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'student' | 'service'>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(listUrl, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const list = (data.threads || []) as Thread[];
        setThreads(list);
        setActiveId((current) => current || list[0]?.id || null);
      })
      .catch(() => setNote('Could not load messages.'))
      .finally(() => setLoading(false));
  }, [listUrl]);

  const lastAt = (item: Thread) => item.messages[item.messages.length - 1]?.at || item.createdAt;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((item) => filter === 'all' || item.kind === filter)
      .filter((item) => !q || [item.name, item.email, item.courseTitle, item.lessonTitle, item.topic].some((field) => field?.toLowerCase().includes(q)))
      .sort((a, b) => new Date(lastAt(b)).getTime() - new Date(lastAt(a)).getTime());
  }, [threads, filter, query]);
  const unanswered = threads.filter((item) => item.status === 'open').length;
  const active = threads.find((item) => item.id === activeId) || null;

  useEffect(() => { threadEnd.current?.scrollIntoView({ block: 'end' }); }, [activeId, active?.messages.length]);

  const send = async () => {
    if (!active || !reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(replyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyBody ? replyBody(active.id, reply.trim()) : { id: active.id, text: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setNote(data.message || 'Reply failed.'); return; }
      setThreads(data.threads || []);
      setReply('');
      setNote('');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-[min(calc(100vh-7.5rem),760px)] min-h-[480px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* ── CONVERSATION LIST ── */}
      <aside className={`${showChatOnMobile ? 'hidden' : 'flex'} w-full flex-col border-r border-slate-200 md:flex md:w-80 lg:w-96`}>
        <div className="space-y-3 border-b border-slate-200 p-4">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-extrabold">{title}</h2>
              {unanswered > 0 && <span className="rounded-full bg-[#FACC15] px-2 py-0.5 text-[11px] font-extrabold text-[#111827]">{unanswered} unanswered</span>}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{intro}</p>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, course, lesson…" className="w-full bg-transparent text-sm focus:outline-none" />
          </label>
          <div className="flex gap-1.5 text-xs font-bold">
            {(['all', 'student', 'service'] as const).map((key) => (
              <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 ${filter === key ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {key === 'all' ? 'All' : key === 'student' ? 'Lesson questions' : 'Consultations'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Loading messages…</p>
          ) : visible.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{threads.length ? 'No messages match.' : 'No messages yet. Student lesson questions and contact-page bookings arrive here.'}</p>
          ) : visible.map((item) => {
            const last = item.messages[item.messages.length - 1];
            const isActive = item.id === activeId;
            return (
              <button key={item.id} type="button" onClick={() => { setActiveId(item.id); setShowChatOnMobile(true); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-[#FEF9C3]' : 'hover:bg-slate-50'}`}>
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-[#FACC15]">
                  {initials(item.name)}
                  {item.status === 'open' && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#FACC15]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate text-sm ${item.status === 'open' ? 'font-extrabold' : 'font-semibold'}`}>{item.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{shortTime(lastAt(item))}</span>
                  </span>
                  <span className="block truncate text-[11px] font-semibold text-slate-500">
                    {item.kind === 'student' ? (item.lessonTitle || item.courseTitle || 'Lesson question') : (item.topic || 'Consultation')}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{last?.from !== 'sender' ? 'You: ' : ''}{last?.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── CHAT PANE ── */}
      <div className={`${showChatOnMobile ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
        {active ? (
          <>
            <header className="space-y-2 border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowChatOnMobile(false)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Back to messages">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-[#FACC15]">{initials(active.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{active.name}</div>
                  <div className="truncate text-xs text-slate-500">{active.kind === 'service' ? 'Consultation request' : 'Student'} · {active.email}</div>
                </div>
                {active.phone && <a href={`tel:${active.phone}`} title={active.phone} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Phone className="h-4 w-4" /></a>}
                <a href={`mailto:${active.email}`} title={active.email} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Mail className="h-4 w-4" /></a>
              </div>
              {active.courseTitle && (
                <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>
                    <strong>{active.courseTitle}</strong>{[active.moduleTitle, active.lessonTitle].filter(Boolean).map((part) => ` · ${part}`).join('')}
                    {active.rank ? <span className="text-slate-500"> · Rank {active.rank}{active.rankTotal ? ` of ${active.rankTotal}` : ''} · {active.progress || 0}% done</span> : null}
                    {active.instructorName && <span className="text-slate-500"> · Instructor: {active.instructorName}</span>}
                  </span>
                </div>
              )}
              {(active.topic || appointmentLine(active)) && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-slate-800">
                  <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>
                    {active.topic && <strong>{active.topic}{active.billing ? ` · ${active.billing} billing` : ''}</strong>}
                    {appointmentLine(active) && <span> · Preferred time: {appointmentLine(active)}</span>}
                    {(active.company || active.monthlyRevenue) && <span className="text-slate-500"> · {[active.company, active.monthlyRevenue && `Revenue ${active.monthlyRevenue}`].filter(Boolean).join(' · ')}</span>}
                  </span>
                </div>
              )}
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
              {active.messages.map((message) => {
                const mine = message.from !== 'sender';
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? `rounded-br-md text-white ${message.from === 'admin' ? 'bg-[#111827]' : 'bg-sky-700'}` : 'rounded-bl-md bg-white text-slate-800'}`}>
                      {mine && <p className="mb-0.5 text-[10px] font-bold text-white/70">{message.from === 'admin' ? 'Admin' : 'Instructor'}</p>}
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{fullTime(message.at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={threadEnd} />
            </div>

            <div className="border-t border-slate-200 p-3">
              {note && <p className="mb-2 text-xs text-rose-600">{note}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  placeholder={active.kind === 'student' ? `Answer ${active.name}'s question…` : `Reply to ${active.name}…`}
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
                <button type="button" onClick={send} disabled={!reply.trim() || sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FACC15] text-[#111827] transition hover:bg-[#EAB308] disabled:opacity-40" aria-label="Send reply">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-slate-400">{active.kind === 'student' ? 'The student sees your answer under this lesson.' : 'Saved here — contact them by phone or email to confirm.'} · Enter to send</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-slate-50 p-8 text-center text-sm text-slate-500">
            {threads.length ? 'Select a conversation to read and reply.' : 'No messages yet.'}
          </div>
        )}
      </div>
    </section>
  );
}
