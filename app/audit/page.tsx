'use client';

import { useEffect, useState } from 'react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { listAudit, sessions } from '@/lib/workspace';

export default function AuditPage() {
  const [rows, setRows] = useState(listAudit());
  const [logins, setLogins] = useState(sessions());
  useEffect(() => {
    setRows(listAudit());
    setLogins(sessions());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Audit log</h1>
        <WorkspaceLinks />
        <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100" onClick={() => { setRows(listAudit()); setLogins(sessions()); }}>Refresh</button>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <h2 className="font-bold">Sign-ins</h2>
          {logins.map((item) => (
            <p key={item.at + item.email} className="text-sm">{item.email} · {new Date(item.at).toLocaleString()}</p>
          ))}
          {logins.length === 0 && <p className="text-sm text-slate-600">No sign-in recorded yet.</p>}
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          {rows.map((item) => (
            <p key={item.id} className="text-sm">
              <span className="text-slate-500">{new Date(item.at).toLocaleString()}</span> — {item.text}
            </p>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-600">No activity yet. Exams, messages, bookings, and course changes are recorded here.</p>}
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
