'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Mail, Pencil, Phone, Search, Send, Trash2 } from 'lucide-react';
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

const statusStyle: Record<RequestItem['status'], { label: string; dot: string; pill: string }> = {
  new: { label: 'New', dot: 'bg-[#FACC15]', pill: 'bg-amber-50 text-amber-800 border-amber-200' },
  progress: { label: 'In progress', dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-800 border-sky-200' },
  done: { label: 'Done', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';

function shortTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' });
}

function fullTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<RequestItem | null>(null);
  const [note, setNote] = useState('');
  const threadEnd = useRef<HTMLDivElement>(null);

  const load = () => fetch('/api/admin/service-requests').then((res) => res.json()).then((data) => {
    const list = (data.requests || []) as RequestItem[];
    setRequests(list);
    setActiveId((current) => current || list[0]?.id || null);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const lastAt = (item: RequestItem) => item.thread[item.thread.length - 1]?.at || item.createdAt;
  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...requests]
      .filter((item) => !q || [item.name, item.planName, item.email, item.phone].some((field) => field?.toLowerCase().includes(q)))
      .sort((a, b) => new Date(lastAt(b)).getTime() - new Date(lastAt(a)).getTime());
  }, [requests, query]);

  const active = requests.find((item) => item.id === activeId) || null;

  useEffect(() => { threadEnd.current?.scrollIntoView({ block: 'end' }); }, [activeId, active?.thread.length]);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Update failed.'); return false; }
    setRequests(data.requests || []);
    setNote('');
    return true;
  };

  const sendReply = async () => {
    if (!active || !reply.trim() || sending) return;
    setSending(true);
    if (await post({ action: 'reply', id: active.id, text: reply.trim() })) setReply('');
    setSending(false);
  };

  const openConversation = (id: string) => {
    setActiveId(id);
    setShowChatOnMobile(true);
  };

  return (
    <section className="flex h-[calc(100vh-7.5rem)] min-h-[480px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* ── CONVERSATION LIST ── */}
      <aside className={`${showChatOnMobile ? 'hidden' : 'flex'} w-full flex-col border-r border-slate-200 md:flex md:w-80 lg:w-96`}>
        <div className="space-y-3 border-b border-slate-200 p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-extrabold">Chats</h2>
            <span className="text-xs font-semibold text-slate-500">{requests.length} request{requests.length === 1 ? '' : 's'}</span>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, plan, phone…" className="w-full bg-transparent text-sm focus:outline-none" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Loading requests…</p>
          ) : conversations.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">{requests.length ? 'No chats match your search.' : 'No requests yet. New bookings and service requests will appear here.'}</p>
          ) : conversations.map((item) => {
            const last = item.thread[item.thread.length - 1];
            const isActive = item.id === activeId;
            return (
              <button key={item.id} type="button" onClick={() => openConversation(item.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-[#FEF9C3]' : 'hover:bg-slate-50'}`}>
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-[#FACC15]">
                  {initials(item.name)}
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusStyle[item.status].dot}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate text-sm ${item.status === 'new' ? 'font-extrabold' : 'font-semibold'}`}>{item.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{shortTime(lastAt(item))}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {last?.from === 'admin' ? 'You: ' : ''}{last?.text || item.planName}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── CHAT PANE ── */}
      <div className={`${showChatOnMobile ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
        {active ? (
          <>
            <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 px-4 py-3">
              <button type="button" onClick={() => setShowChatOnMobile(false)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Back to chats">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-[#FACC15]">{initials(active.name)}</span>
              <div className="min-w-[7rem] flex-1">
                <div className="truncate font-bold">{active.name}</div>
                <div className="truncate text-xs text-slate-500">{active.planName}</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
              {active.phone && <a href={`tel:${active.phone}`} title={active.phone} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Phone className="h-4 w-4" /></a>}
              {active.email && <a href={`mailto:${active.email}`} title={active.email} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Mail className="h-4 w-4" /></a>}
              <select aria-label="Request status" className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[active.status].pill}`} value={active.status} onChange={(e) => post({ id: active.id, status: e.target.value })}>
                <option value="new">New</option>
                <option value="progress">In progress</option>
                <option value="done">Done</option>
              </select>
              <button type="button" title="Edit details" onClick={() => setEditing(active)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
              <button type="button" title="Delete request" onClick={() => { if (confirm('Remove this request?')) post({ action: 'delete', id: active.id }).then(() => { setActiveId(null); setShowChatOnMobile(false); }); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
              <p className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
                Request started {fullTime(active.createdAt)}
              </p>
              {active.thread.map((message) => {
                const mine = message.from === 'admin';
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? 'rounded-br-md bg-[#111827] text-white' : 'rounded-bl-md bg-white text-slate-800'}`}>
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{fullTime(message.at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={threadEnd} />
            </div>

            <div className="border-t border-slate-200 p-3">
              {note && <p className="mb-2 text-xs text-rose-600">{note}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder={`Message ${active.name}…`}
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
                <button type="button" onClick={sendReply} disabled={!reply.trim() || sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FACC15] text-[#111827] transition hover:bg-[#EAB308] disabled:opacity-40" aria-label="Send reply">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-slate-50 p-8 text-center text-sm text-slate-500">
            {requests.length ? 'Select a chat to read and reply.' : 'No requests yet.'}
          </div>
        )}
      </div>

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
