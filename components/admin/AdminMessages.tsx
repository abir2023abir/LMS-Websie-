'use client';

import { useEffect, useState } from 'react';

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

function courseLine(item: Thread) {
  if (!item.courseTitle) return '';
  const rank = item.rank ? `Rank ${item.rank}${item.rankTotal ? ` of ${item.rankTotal}` : ''}` : 'Rank not recorded';
  const progress = typeof item.progress === 'number' && item.rank ? ` · ${item.progress}% of this course` : '';
  const lesson = [item.moduleTitle, item.lessonTitle].filter(Boolean).join(' · ');
  return `${item.courseTitle}${lesson ? ` · ${lesson}` : ''} · ${rank}${progress}`;
}

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
  intro = 'Course questions and consultation requests land here. Course messages include lesson details and the assigned instructor.',
}: {
  listUrl?: string;
  replyUrl?: string;
  replyBody?: (id: string, text: string) => Record<string, unknown>;
  title?: string;
  intro?: string;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'service'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');

  const load = () => {
    fetch(listUrl)
      .then((res) => res.json())
      .then((data) => {
        const list = (data.threads || []) as Thread[];
        setThreads(list);
        setActiveId((current) => current || list[0]?.id || null);
      })
      .catch(() => setNote('Could not load messages.'));
  };

  useEffect(() => { load(); }, []);

  const visible = threads.filter((item) => filter === 'all' || item.kind === filter);
  const active = visible.find((item) => item.id === activeId) || visible[0] || null;

  const send = async () => {
    if (!active || !reply.trim()) return;
    const res = await fetch(replyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyBody ? replyBody(active.id, reply) : { id: active.id, text: reply }),
    });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Reply failed.'); return; }
    setThreads(data.threads || []);
    setReply('');
    setNote('Reply saved in this panel. No email or SMS was sent.');
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">{title} ({visible.length})</h2>
          <p className="text-xs text-slate-500">{intro}</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          {(['all', 'student', 'service'] as const).map((key) => (
            <button key={key} type="button" onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-full ${filter === key ? 'bg-[#111827] text-white' : 'bg-slate-100'}`}>
              {key === 'all' ? 'All' : key === 'student' ? 'Students' : 'Customer service'}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl px-4 py-10 text-center">No messages yet. Students and the contact page can send one into this inbox.</p>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4 min-h-[420px]">
          <div className="lg:col-span-2 space-y-2 max-h-[540px] overflow-y-auto">
            {visible.map((item) => (
              <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={`w-full text-left rounded-2xl border px-3 py-3 ${active?.id === item.id ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-100'}`}>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-[11px] text-slate-500">{item.kind === 'service' ? 'Customer service' : 'Student'} · {item.status}</div>
                {courseLine(item) && <div className="text-[11px] text-slate-700 mt-1">{courseLine(item)}</div>}
                {item.instructorName && <div className="text-[11px] text-slate-500 mt-1">Instructor: {item.instructorName}</div>}
                {appointmentLine(item) && <div className="text-[11px] text-slate-700 mt-1">{appointmentLine(item)}</div>}
              </button>
            ))}
          </div>
          {active && (
            <div className="lg:col-span-3 border border-slate-100 rounded-2xl p-4 flex flex-col">
              <div>
                <div className="font-bold">{active.name}</div>
                <div className="text-[11px] text-slate-500">{active.email} · {active.kind === 'service' ? 'Customer service' : 'Student'}</div>
                {courseLine(active) && <div className="text-xs font-semibold mt-1">{courseLine(active)}</div>}
                {active.instructorName && <div className="mt-1 text-xs text-slate-500">Instructor: {active.instructorName}</div>}
                {active.topic && <div className="mt-1 text-xs font-semibold text-slate-700">Topic: {active.topic}{active.billing ? ` · ${active.billing} billing` : ''}</div>}
                {appointmentLine(active) && <div className="mt-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-slate-800">Preferred time: {appointmentLine(active)} · pending confirmation</div>}
                {(active.phone || active.company || active.monthlyRevenue) && <div className="mt-1 text-xs text-slate-500">{[active.phone && `Phone: ${active.phone}`, active.company && `Company: ${active.company}`, active.monthlyRevenue && `Monthly revenue: ${active.monthlyRevenue}`].filter(Boolean).join(' · ')}</div>}
              </div>
              <div className="flex-1 space-y-2 my-4 max-h-80 overflow-y-auto">
                {active.messages.map((message) => (
                  <div key={message.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.from === 'sender' ? 'bg-slate-100' : `ml-auto ${message.from === 'admin' ? 'bg-[#111827]' : 'bg-sky-700'} text-white`}`}>
                    <div className="mb-1 text-[10px] opacity-70">{message.from === 'admin' ? 'Admin' : message.from === 'instructor' ? 'Instructor' : active.name}</div>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                <button type="button" onClick={send} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 rounded-xl">Reply</button>
              </div>
            </div>
          )}
        </div>
      )}
      {note && <p className="text-sm font-semibold">{note}</p>}
    </section>
  );
}
