'use client';

import { useEffect, useState, type FormEvent } from 'react';

export default function CampusMessageForm({
  kind = 'service',
  lockedKind = false,
  defaultName = '',
  defaultEmail = '',
}: {
  kind?: 'student' | 'service';
  lockedKind?: boolean;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [channel, setChannel] = useState<'student' | 'service'>(kind);
  const [text, setText] = useState('');
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
        body: JSON.stringify({ kind: lockedKind ? kind : channel, name, email, text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNote(data.message || 'Could not send.');
        return;
      }
      setText('');
      setNote('Sent to the admin inbox. A reply stays there until someone answers in the panel.');
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
        <p className="mt-1 text-sm text-slate-500">This goes to the admin Messages tab. It is not sent by email or SMS.</p>
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
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Your message" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      <button disabled={sending} className="rounded-full bg-[#111827] text-white text-sm font-bold px-5 py-2.5 disabled:opacity-60">
        {sending ? 'Sending…' : 'Send to admin'}
      </button>
      {note && <p className="text-sm font-semibold">{note}</p>}
    </form>
  );
}
