'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

type Certificate = { id: string; studentName: string; course: string; date: string };

const empty = { studentName: '', course: '', date: new Date().toISOString().slice(0, 10) };

export default function AdminCertificates() {
  const [rows, setRows] = useState<Certificate[]>([]);
  const [draft, setDraft] = useState<typeof empty & { id?: string }>(empty);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/certificates').then((res) => res.json()).then((data) => setRows(data.certificates || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const res = await fetch('/api/admin/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setRows(data.certificates || []);
    setOpen(false);
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">Certificates ({rows.length})</h2>
          <p className="text-xs text-slate-500">Issues a PDF with the student name, course, and date. Built with the open-source pdf-lib library.</p>
        </div>
        <button type="button" onClick={() => { setDraft(empty); setNote(''); setOpen(true); }} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">Issue certificate</button>
      </div>
      {rows.length === 0 ? <p className="text-sm text-slate-500">No certificates yet.</p> : (
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b text-slate-400 uppercase"><th className="py-2">Student</th><th>Course</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="py-3 font-bold">{row.studentName}</td>
                <td>{row.course}</td>
                <td>{row.date}</td>
                <td className="text-right space-x-2">
                  <a className="text-xs font-bold underline" href={`/api/admin/certificates/pdf?id=${encodeURIComponent(row.id)}`} target="_blank" rel="noreferrer">PDF</a>
                  <button type="button" title="Edit" onClick={() => { setDraft(row); setOpen(true); }} className="p-1.5"><Pencil className="w-4 h-4 inline" /></button>
                  <button type="button" title="Delete" onClick={async () => {
                    if (!confirm('Delete this certificate?')) return;
                    const res = await fetch('/api/admin/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: row.id }) });
                    const data = await res.json();
                    setRows(data.certificates || []);
                  }} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <AdminModal title={draft.id ? 'Edit certificate' : 'Issue certificate'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Student name" value={draft.studentName} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })} />
            <input className={fieldClass} placeholder="Course" value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
            <input className={fieldClass} type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save certificate</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
