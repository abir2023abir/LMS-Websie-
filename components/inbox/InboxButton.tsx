'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Inbox, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { answerMessage, deleteMessage, sendMessage, visibleMessages } from '@/lib/workspace';

type Scope = 'own' | 'student' | 'service' | 'care' | 'all';

const titles: Record<Scope, string> = {
  own: 'Inbox',
  student: 'Student messages',
  service: 'Customer service',
  care: 'Customer care',
  all: 'All messages',
};

export default function InboxButton({ scope, onDark = false }: { scope: Scope; onDark?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ReturnType<typeof visibleMessages>>([]);
  const [text, setText] = useState('');
  const [context, setContext] = useState(scope === 'service' ? 'Service' : 'Lesson');
  const [reply, setReply] = useState('');
  const email = user?.email || '';

  const refresh = () => setList(visibleMessages(scope, email));

  useEffect(() => {
    refresh();
  }, [user, scope]);

  if (!user && scope !== 'all') return null;

  const unread = list.filter((item) => item.status === 'unanswered').length;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          refresh();
          setOpen(true);
        }}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center border ${
          onDark
            ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            : 'bg-[#111827] text-[#FACC15] border-black/10'
        }`}
        aria-label="Open inbox"
        title={titles[scope]}
      >
        <Inbox className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FACC15] text-[#111827] text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close inbox"
              className="fixed inset-0 bg-black/40 z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white text-[#111827] shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl">{titles[scope]}</h2>
                  <p className="text-xs text-slate-500">
                    {scope === 'student' && 'Student messages also reach admin and customer care.'}
                    {scope === 'service' && 'Service messages also reach the admin panel.'}
                    {scope === 'care' && 'Student and service messages. The admin panel sees the same list.'}
                    {scope === 'all' && 'Students, instructors, and customer service.'}
                    {scope === 'own' && 'Your messages to your mentor or customer service.'}
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {(scope === 'own' || scope === 'care') && (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!text.trim()) return;
                      sendMessage(email || 'student@local', text, context);
                      setText('');
                      refresh();
                    }}
                  >
                    <select value={context} onChange={(e) => setContext(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option>Lesson</option>
                      <option>Exam</option>
                      <option>Service</option>
                    </select>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-20" placeholder="Write the message" />
                    <button className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl">Send</button>
                  </form>
                )}
                {list.map((item) => (
                  <article key={item.id} className="border border-slate-200 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold uppercase text-slate-500">{item.context} · {item.status}</p>
                    <p className="font-semibold text-sm">{item.from}</p>
                    <p className="text-sm">{item.text}</p>
                    {item.reply && <p className="text-sm">Reply: {item.reply}</p>}
                    {scope !== 'own' && item.status === 'unanswered' && (
                      <form
                        className="flex gap-2 pt-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          answerMessage(item.id, reply || 'Answered');
                          setReply('');
                          refresh();
                        }}
                      >
                        <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                        <button className="text-xs font-bold underline">Send</button>
                      </form>
                    )}
                    {scope === 'all' && (
                      <button type="button" className="text-xs text-rose-600 font-bold" onClick={() => { deleteMessage(item.id); refresh(); }}>Delete</button>
                    )}
                  </article>
                ))}
                {list.length === 0 && <p className="text-sm text-slate-600">No messages in this panel yet.</p>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  );
}
