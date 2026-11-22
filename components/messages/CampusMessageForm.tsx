'use client';

import { useEffect, useState, type FormEvent } from 'react';

export default function CampusMessageForm({
  kind = 'service',
  lockedKind = false,
  defaultName = '',
  defaultEmail = '',
  context,
  courses,
}: {
  kind?: 'student' | 'service';
  lockedKind?: boolean;
  defaultName?: string;
  defaultEmail?: string;
  /** The course and lesson a student writes from (the classroom); course messages need it. */
  context?: { courseId: string; courseTitle?: string; moduleTitle?: string; lessonId?: string; lessonTitle?: string };
  /** A student's courses to choose from when there is no classroom context (Student → Messages). */
  courses?: { id: string; title: string }[];
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [channel, setChannel] = useState<'student' | 'service'>(kind);
  const [text, setText] = useState('');
  const [courseId, setCourseId] = useState('');
  const needsCourse = (lockedKind ? kind : channel) === 'student' && !context;
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (defaultName) setName((current) => current || defaultName);
    if (defaultEmail) setEmail((current) => current || defaultEmail);
  }, [defaultName, defaultEmail]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setNote('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: lockedKind ? kind : channel, name, email, text, ...(context || (needsCourse ? { courseId, courseTitle: courses?.find((item) => item.id === courseId)?.title || '' } : {})) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNote(data.message || 'Could not send.');
        return;
      }
      setText('');
      setNote((lockedKind ? kind : channel) === 'student' ? 'Sent to your instructor and the admin. The reply appears in your inbox.' : 'Sent to the admin inbox. A reply stays there until someone answers in the panel.');
    } catch {
      setNote('Could not send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <h2 className="font-display font-extrabold text-2xl">Write to the campus</h2>
        <p className="mt-1 text-sm text-slate-500">{(lockedKind ? kind : channel) === 'student' ? 'Your instructor and the admin see this message with your course. It is not sent by email or SMS.' : 'This goes to the admin Messages tab. It is not sent by email or SMS.'}</p>
      </div>
      {!lockedKind && (
        <label className="block text-xs font-bold text-slate-600">
          This message is
          <select value={channel} onChange={(e) => setChannel(e.target.value as 'student' | 'service')} className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            <option value="student">From a student</option>
            <option value="service">A customer service inquiry</option>
          </select>
        </label>
      )}
      {needsCourse && (
        <label className="block text-xs font-bold text-slate-600">
          Course
          <select required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            <option value="">Choose the course this is about</option>
            {(courses || []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      )}
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Your message" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <button disabled={sending} className="rounded-full bg-[#111827] text-white text-sm font-bold px-5 py-2.5 disabled:opacity-60">
        {sending ? 'Sending…' : (lockedKind ? kind : channel) === 'student' ? 'Send message' : 'Send to admin'}
      </button>
      {note && <p className="text-sm font-semibold">{note}</p>}
    </form>
  );
}
