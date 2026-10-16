'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';
import { taka } from '@/lib/utils';

type Payment = {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  transactionId: string;
  screenshot: string;
  source: 'sslcommerz' | 'manual';
};

const empty = {
  studentName: '',
  studentEmail: '',
  courseTitle: '',
  amount: 0,
  method: 'Personal bKash',
  status: 'pending' as const,
  transactionId: '',
  source: 'manual' as const,
};

export default function AdminPaymentsBoard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [draft, setDraft] = useState<Partial<Payment>>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Payment | null>(null);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/payment-ledger').then((res) => res.json()).then((data) => setPayments(data.payments || []));
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: Payment['status']) => {
    const res = await fetch('/api/admin/payment-ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'status', id, status }) });
    const data = await res.json();
    setPayments(data.payments || []);
    setViewing((current) => (current && current.id === id ? { ...current, status } : current));
  };

  const save = async () => {
    const form = new FormData();
    if (draft.id) form.set('id', draft.id);
    form.set('studentName', draft.studentName || '');
    form.set('studentEmail', draft.studentEmail || '');
    form.set('courseTitle', draft.courseTitle || '');
    form.set('amount', String(draft.amount || 0));
    form.set('method', draft.method || '');
    form.set('transactionId', draft.transactionId || '');
    form.set('status', draft.status || 'pending');
    form.set('source', draft.source || 'manual');
    if (file) form.set('screenshot', file);
    const res = await fetch('/api/admin/payment-ledger', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setPayments(data.payments || []);
    setOpen(false);
    setFile(null);
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">Payment records ({payments.length})</h2>
          <p className="text-xs text-slate-500">SSLCommerz rows and manual bKash or Nagad rows. Open a row for the transaction ID and screenshot, then approve or reject a manual payment.</p>
        </div>
        <button type="button" onClick={() => { setDraft(empty); setFile(null); setNote(''); setOpen(true); }} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">Add manual payment</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-slate-400 uppercase">
              <th className="py-2">Student</th><th>Course</th><th>Amount</th><th>Method</th><th>Status</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-slate-50">
                <td className="py-3 font-bold">{payment.studentName}</td>
                <td>{payment.courseTitle}</td>
                <td>{taka(payment.amount)}</td>
                <td>{payment.method}</td>
                <td className="capitalize">{payment.status}</td>
                <td className="text-right whitespace-nowrap">
                  <button type="button" className="text-xs font-bold underline mr-2" onClick={() => setViewing(payment)}>View</button>
                  <button type="button" title="Edit" onClick={() => { setDraft(payment); setFile(null); setOpen(true); }} className="p-1.5"><Pencil className="w-4 h-4 inline" /></button>
                  {payment.source === 'manual' && payment.status === 'pending' && (
                    <>
                      <button type="button" className="text-xs font-bold text-green-700 px-2" onClick={() => setStatus(payment.id, 'approved')}>Approve</button>
                      <button type="button" className="text-xs font-bold text-rose-600 px-2" onClick={() => setStatus(payment.id, 'rejected')}>Reject</button>
                    </>
                  )}
                  <button type="button" title="Delete" onClick={async () => {
                    if (!confirm('Delete this payment record?')) return;
                    const res = await fetch('/api/admin/payment-ledger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: payment.id }) });
                    const data = await res.json();
                    setPayments(data.payments || []);
                  }} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <AdminModal title={draft.id ? 'Edit payment' : 'Add manual payment'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Student" value={draft.studentName || ''} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })} />
            <input className={fieldClass} placeholder="Email" value={draft.studentEmail || ''} onChange={(e) => setDraft({ ...draft, studentEmail: e.target.value })} />
            <input className={fieldClass} placeholder="Course" value={draft.courseTitle || ''} onChange={(e) => setDraft({ ...draft, courseTitle: e.target.value })} />
            <input className={fieldClass} type="number" placeholder="Amount in টাকা" value={draft.amount || 0} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
            <select className={fieldClass} value={draft.method || 'Personal bKash'} onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
              <option>Personal bKash</option>
              <option>Personal Nagad</option>
              <option>SSLCommerz (bKash)</option>
              <option>SSLCommerz (Nagad)</option>
              <option>SSLCommerz (Visa)</option>
              <option>SSLCommerz</option>
            </select>
            <input className={fieldClass} placeholder="Transaction ID" value={draft.transactionId || ''} onChange={(e) => setDraft({ ...draft, transactionId: e.target.value })} />
            <label className="block text-xs font-bold text-slate-500">Payment screenshot
              <input className="mt-1 block text-sm" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save payment</button>
          </div>
        </AdminModal>
      )}
      {viewing && (
        <AdminModal title="Payment details" onClose={() => setViewing(null)}>
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Student:</span> {viewing.studentName} ({viewing.studentEmail || 'no email'})</p>
            <p><span className="font-bold">Course:</span> {viewing.courseTitle}</p>
            <p><span className="font-bold">Amount:</span> {taka(viewing.amount)}</p>
            <p><span className="font-bold">Method:</span> {viewing.method}</p>
            <p><span className="font-bold">Status:</span> {viewing.status}</p>
            <p><span className="font-bold">Transaction ID:</span> {viewing.transactionId || '—'}</p>
            {viewing.screenshot ? (
              <img src={`/api/admin/payment-ledger?proof=${encodeURIComponent(viewing.screenshot)}`} alt="Payment screenshot" className="w-full rounded-xl border" />
            ) : (
              <p className="text-slate-500">No screenshot attached.</p>
            )}
            {viewing.source === 'manual' && (
              <div className="flex gap-2 pt-2">
                <button type="button" className="bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-xl" onClick={() => setStatus(viewing.id, 'approved')}>Approve</button>
                <button type="button" className="bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl" onClick={() => setStatus(viewing.id, 'rejected')}>Reject</button>
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </section>
  );
}
