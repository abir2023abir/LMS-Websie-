'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

type Message = { id: string; from: 'customer' | 'admin'; text: string; at: string };
type RequestItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  planName: string;
  message: string;
  status: 'new' | 'progress' | 'done';
  thread: Message[];
  createdAt: string;
  price: number;
};

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [editing, setEditing] = useState<RequestItem | null>(null);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/service-requests').then((res) => res.json()).then((data) => {
    const list = (data.requests || []) as RequestItem[];
    setRequests(list);
    setActiveId((current) => current || list[0]?.id || null);
  });

  useEffect(() => { load(); }, []);

  const active = requests.find((item) => item.id === activeId) || null;

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Update failed.'); return; }
    setRequests(data.requests || []);
    setNote('');
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div>
        <h2 className="font-display font-extrabold text-xl">Service requests ({requests.length})</h2>
        <p className="text-xs text-slate-500">Open a request to read the thread and reply. Set the status, edit the details, or remove it.</p>
      </div>
      {requests.length === 0 ? (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl px-4 py-8 text-center">No requests yet.</p>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4 min-h-[420px]">
          <div className="lg:col-span-2 space-y-2 max-h-[540px] overflow-y-auto">
            {requests.map((item) => (
              <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={`w-full text-left rounded-2xl border px-3 py-3 ${activeId === item.id ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-100'}`}>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-[11px] text-slate-500">{item.planName} · {item.status === 'progress' ? 'in progress' : item.status}</div>
              </button>
            ))}
          </div>
          {active && (
            <div className="lg:col-span-3 border border-slate-100 rounded-2xl p-4 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold">{active.name}</div>
                  <div className="text-[11px] text-slate-500">{active.email} · {active.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="border border-slate-200 rounded-xl px-2 py-1 text-xs" value={active.status} onChange={(e) => post({ id: active.id, status: e.target.value })}>
                    <option value="new">new</option>
                    <option value="progress">in progress</option>
                    <option value="done">done</option>
                  </select>
                  <button type="button" title="Edit" onClick={() => setEditing(active)} className="p-1.5 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                  <button type="button" title="Delete" onClick={() => { if (confirm('Remove this request?')) post({ action: 'delete', id: active.id }); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 space-y-2 my-4 max-h-80 overflow-y-auto">
                {active.thread.map((message) => (
                  <div key={message.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.from === 'admin' ? 'ml-auto bg-[#111827] text-white' : 'bg-slate-100'}`}>
                    <div className="text-[10px] opacity-70 mb-1">{message.from === 'admin' ? 'Admin' : active.name}</div>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={fieldClass} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to this request" />
                <button type="button" className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 rounded-xl" onClick={async () => { await post({ action: 'reply', id: active.id, text: reply }); setReply(''); }}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}
      {note && <p className="text-sm text-rose-600">{note}</p>}
      {editing && (
        <AdminModal title="Edit request" onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <input className={fieldClass} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <input className={fieldClass} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            <input className={fieldClass} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            <textarea className={fieldClass} rows={4} value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} />
            <button type="button" className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl" onClick={async () => { await post({ id: editing.id, name: editing.name, phone: editing.phone, email: editing.email, message: editing.message }); setEditing(null); }}>Save details</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
