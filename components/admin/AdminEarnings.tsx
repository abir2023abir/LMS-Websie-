'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';
import { taka } from '@/lib/utils';

type Row = { id: string; studentName: string; courseTitle: string; amount: number; method: string; status: string; date: string };
const empty: Omit<Row, 'id'> = { studentName: '', courseTitle: '', amount: 0, method: 'SSLCommerz', status: 'Paid', date: '' };

export default function AdminEarnings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Partial<Row>>(empty);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    setLoading(true); setLoadError('');
    try { const res = await fetch('/api/admin/earnings', { cache: 'no-store' }); const data = await res.json(); if (!res.ok) throw new Error(data.message || 'Could not load earnings.'); setRows(data.earnings || []); }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Could not load earnings.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const save = async () => {
    const res = await fetch('/api/admin/earnings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setRows(data.earnings || []);
    setOpen(false);
  };

  return (
    <section className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-100"><div className="text-xs text-slate-500 font-bold uppercase">Listed revenue</div><div className="text-3xl font-extrabold mt-2">{total > 0 ? taka(total) : '৳0'}</div></div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100"><div className="text-xs text-slate-500 font-bold uppercase">Rows</div><div className="text-3xl font-extrabold mt-2">{rows.length}</div></div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100"><div className="text-xs text-slate-500 font-bold uppercase">Paid rows</div><div className="text-3xl font-extrabold mt-2 text-green-600">{rows.filter((row) => row.status.toLowerCase() === 'paid').length}</div></div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl">Earnings</h2>
          <button type="button" onClick={() => { setDraft(empty); setNote(''); setOpen(true); }} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">Add row</button>
        </div>
        <p className="text-xs text-slate-500">Amounts are in taka. Edit a row to change the student, course, amount, method, or status.</p>
        {loading ? <div className="py-10 text-center text-sm text-slate-500">Loading earnings…</div> : loadError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError} <button type="button" onClick={() => void load()} className="ml-2 font-bold underline">Try again</button></div> : rows.length === 0 ? <div className="rounded-2xl bg-slate-50 p-10 text-center"><p className="font-semibold text-slate-700">No earnings recorded</p><p className="mt-1 text-sm text-slate-500">Successful payments will be reflected here.</p></div> : rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm">
            <div>
              <div className="font-bold">{row.studentName}</div>
              <div className="text-[11px] text-slate-500">{row.courseTitle} · {row.method} · {row.status} · {row.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-green-600">{taka(row.amount)}</span>
              <button type="button" title="Edit" onClick={() => { setDraft(row); setOpen(true); }} className="p-1.5"><Pencil className="w-4 h-4" /></button>
              <button type="button" title="Delete" onClick={async () => {
                if (!confirm('Delete this earning row?')) return;
                const res = await fetch('/api/admin/earnings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: row.id }) });
                const data = await res.json();
                setRows(data.earnings || []);
              }} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <AdminModal title={draft.id ? 'Edit earning' : 'Add earning'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Student" value={draft.studentName || ''} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })} />
            <input className={fieldClass} placeholder="Course" value={draft.courseTitle || ''} onChange={(e) => setDraft({ ...draft, courseTitle: e.target.value })} />
            <input className={fieldClass} type="number" placeholder="Amount in টাকা" value={draft.amount || 0} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
            <input className={fieldClass} placeholder="Method" value={draft.method || ''} onChange={(e) => setDraft({ ...draft, method: e.target.value })} />
            <input className={fieldClass} placeholder="Status" value={draft.status || ''} onChange={(e) => setDraft({ ...draft, status: e.target.value })} />
            <input className={fieldClass} placeholder="Date" value={draft.date || ''} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
