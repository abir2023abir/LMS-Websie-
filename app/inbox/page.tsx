'use client';

import { useEffect, useState } from 'react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { useAuth } from '@/context/AuthContext';
import { answerMessage, deleteMessage, messages, sendMessage } from '@/lib/workspace';

export default function InboxPage() {
  const { user } = useAuth();
  const [list, setList] = useState(messages());
  const [text, setText] = useState('');
  const [context, setContext] = useState('Lesson');
  const [reply, setReply] = useState('');
  const refresh = () => setList(messages());
  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Inbox</h1>
        <WorkspaceLinks />
        <form
          className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            sendMessage(user?.email || 'student@local', text, context);
            setText('');
            refresh();
          }}
        >
          <label className="text-xs font-bold text-slate-500">Tied to</label>
          <select value={context} onChange={(e) => setContext(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <option>Lesson</option>
            <option>Service</option>
            <option>Exam</option>
          </select>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-24" placeholder="Write the question" />
          <button className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl">Send</button>
        </form>
        <section className="space-y-3">
          {list.map((item) => (
            <article key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">{item.context} · {item.status}</p>
              <p className="font-semibold mt-1">{item.from}</p>
              <p className="text-sm mt-1">{item.text}</p>
              {item.reply && <p className="text-sm mt-2">Reply: {item.reply}</p>}
              {item.status === 'unanswered' && (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    answerMessage(item.id, reply || 'Answered');
                    setReply('');
                    refresh();
                  }}
                >
                  <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                  <button className="text-xs font-bold underline">Send reply</button>
                </form>
              )}
              <button type="button" className="mt-2 text-xs text-rose-600 font-bold" onClick={() => { deleteMessage(item.id); refresh(); }}>Delete</button>
            </article>
          ))}
          {list.length === 0 && <p className="text-sm text-slate-600">No messages yet.</p>}
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
