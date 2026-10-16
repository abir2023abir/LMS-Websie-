'use client';

import { useEffect, useState } from 'react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { useAuth } from '@/context/AuthContext';
import { addEvent, events, markNoticeRead, notices } from '@/lib/workspace';

export default function CalendarPage() {
  const { role } = useAuth();
  const [rows, setRows] = useState(events());
  const [notes, setNotes] = useState(notices());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [meet, setMeet] = useState('');
  const [kind, setKind] = useState<'class' | 'exam' | 'meeting' | 'deadline'>('class');
  const refresh = () => {
    setRows(events());
    setNotes(notices());
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Calendar and notices</h1>
        <WorkspaceLinks />
        <form
          className="bg-white rounded-3xl border border-slate-200 p-6 grid sm:grid-cols-2 gap-3 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title || !date) return;
            addEvent(title, kind, date, meet);
            setTitle('');
            setMeet('');
            refresh();
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="meeting">Meeting</option>
            <option value="deadline">Deadline</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <input value={meet} onChange={(e) => setMeet(e.target.value)} placeholder="Google Meet link" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <button className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl sm:col-span-2">Add to calendar</button>
        </form>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <h2 className="font-bold">Classroom</h2>
          {rows.filter((item) => item.kind === 'class' || item.kind === 'meeting').map((item) => (
            <p key={item.id} className="text-sm">{item.date} · {item.title} {item.meet && <a className="underline" href={item.meet} target="_blank" rel="noreferrer">Open Meet</a>}</p>
          ))}
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          {rows.map((item) => (
            <p key={item.id} className="text-sm">
              <span className="font-bold">{item.date}</span> · {item.kind} · {item.title}
              {item.meet && (
                <a href={item.meet} className="ml-2 underline" target="_blank" rel="noreferrer">Meet</a>
              )}
            </p>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-600">No dates yet.</p>}
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <h2 className="font-bold">Notices</h2>
          {notes.filter((item) => item.role === 'all' || item.role === role || !role).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                markNoticeRead(item.id);
                refresh();
                if (item.href) window.location.href = item.href;
              }}
              className={`block text-left text-sm w-full ${item.read ? 'text-slate-400' : 'font-semibold'}`}
            >
              {item.read ? 'Read' : 'New'} · {item.role}: {item.text}
            </button>
          ))}
          {notes.length === 0 && <p className="text-sm text-slate-600">No notices yet.</p>}
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
