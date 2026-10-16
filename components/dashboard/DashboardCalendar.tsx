'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { addEvent, events, markNoticeRead, notices } from '@/lib/workspace';
import { useAuth } from '@/context/AuthContext';

export default function DashboardCalendar() {
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

  useEffect(() => {
    refresh();
  }, []);

  const visibleNotes = notes.filter((item) => item.role === 'all' || item.role === role || !role);

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-bold text-xl">Calendar</h2>
        <Link href="/exams" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 hover:bg-[#FACC15]">Exams</Link>
      </div>
      <form
        className="grid sm:grid-cols-2 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title || !date) return;
          addEvent(title, kind, date, meet);
          setTitle('');
          setMeet('');
          refresh();
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Class, exam, or meeting" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
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
      <div className="space-y-2">
        {rows.map((item) => (
          <p key={item.id} className="text-sm">
            <span className="font-bold">{item.date}</span> · {item.kind} · {item.title}
            {item.meet && <a href={item.meet} className="ml-2 underline" target="_blank" rel="noreferrer">Meet</a>}
          </p>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-600">No dates yet.</p>}
      </div>
      {visibleNotes.length > 0 && (
        <div className="space-y-1 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold uppercase text-slate-500">Notices</p>
          {visibleNotes.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`block text-left text-sm ${item.read ? 'text-slate-400' : 'font-semibold'}`}
              onClick={() => {
                markNoticeRead(item.id);
                refresh();
                if (item.href && item.href !== '/calendar') window.location.href = item.href;
              }}
            >
              {item.read ? 'Read' : 'New'}: {item.text}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
