'use client';

import { useEffect, useState, type FormEvent } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import InboxButton from '@/components/inbox/InboxButton';
import { useAuth } from '@/context/AuthContext';
import {
  addBookingDocument,
  addRevision,
  approveBooking,
  assignStaff,
  bookingsFor,
  createBooking,
  invoiceBooking,
  packages,
  payBooking,
  reviseQuote,
  setDeliverable,
  updatePackage,
} from '@/lib/workspace';
import { Briefcase, LogOut } from 'lucide-react';
import { taka } from '@/lib/utils';

export default function ServiceCustomerPage() {
  return (
    <AuthGuard allowedRole="ServiceCustomer">
      <ServiceHome />
    </AuthGuard>
  );
}

function ServiceHome() {
  const { user, userProfile, logout } = useAuth();
  const email = user?.email || userProfile?.email || '';
  const [packs, setPacks] = useState(packages());
  const [rows, setRows] = useState(bookingsFor(email));
  const [business, setBusiness] = useState('');
  const [packageId, setPackageId] = useState(packs[0]?.id || 'basic');
  const [docName, setDocName] = useState('');
  const [staff, setStaff] = useState('');
  const [scope, setScope] = useState('');
  const [fee, setFee] = useState('');
  const [deadline, setDeadline] = useState('7 days');
  const [deliverable, setDeliverableText] = useState('');
  const [revision, setRevision] = useState('');
  const refresh = () => {
    setPacks(packages());
    setRows(bookingsFor(email));
  };
  useEffect(() => { refresh(); }, [email]);

  const book = (e: FormEvent) => {
    e.preventDefault();
    if (!business.trim()) return;
    createBooking(email, business, packageId);
    setBusiness('');
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 pb-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] text-white text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5 text-[#FACC15]" /> Bookkeeping service
            </div>
            <h1 className="font-display font-extrabold text-3xl mt-2">{userProfile?.name || 'Service customer'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <InboxButton scope="care" />
            <button onClick={logout} className="p-3 rounded-full bg-white/40" title="Sign out"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </section>
      <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-6">
        <DashboardCalendar />
        <WorkspaceLinks />
        <section className="grid sm:grid-cols-2 gap-3">
          {packs.map((item) => (
            <article key={item.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h2 className="font-bold">{item.name}</h2>
              <p className="text-sm">{taka(item.price)}</p>
              <input
                defaultValue={item.includes}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                onBlur={(e) => {
                  updatePackage(item.id, item.price, e.target.value);
                  refresh();
                }}
              />
            </article>
          ))}
        </section>
        <form onSubmit={book} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h2 className="font-bold">Book a service</h2>
          <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <select value={packageId} onChange={(e) => setPackageId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            {packs.map((item) => (
              <option key={item.id} value={item.id}>{item.name} — {taka(item.price)}</option>
            ))}
          </select>
          <button className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl">Request quotation</button>
        </form>
        {rows.map((item) => (
          <article key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
            <p className="text-xs font-bold uppercase text-slate-500">{item.status}</p>
            <h3 className="font-bold">{item.business}</h3>
            <p className="text-sm">Scope: {item.scope}</p>
            <p className="text-sm">Fee: {taka(item.fee)} · Deadline: {item.deadline}</p>
            <p className="text-sm">Staff: {item.staff || 'not assigned'}</p>
            <p className="text-sm">Deliverable: {item.deliverable || 'not sent yet'}</p>
            <p className="text-xs text-slate-500">Quotation versions: {item.quotes.length}</p>
            <ul className="text-sm">
              {item.documents.map((doc) => (
                <li key={`${doc.name}-${doc.version}`}>v{doc.version} · {doc.name}</li>
              ))}
              {item.documents.length === 0 && <li>No documents yet.</li>}
            </ul>
            {item.revisions.length > 0 && <p className="text-sm">Revisions: {item.revisions.join(' | ')}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              {item.status === 'quoted' && (
                <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-[#FACC15]" onClick={() => { approveBooking(item.id); refresh(); }}>Approve quotation</button>
              )}
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!docName.trim()) return; addBookingDocument(item.id, docName); setDocName(''); refresh(); }}>
                <input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Bank statement or receipt name" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Save document</button>
              </form>
              <label className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 cursor-pointer">
                Upload file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    addBookingDocument(item.id, file.name);
                    e.target.value = '';
                    refresh();
                  }}
                />
              </label>
              <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); reviseQuote(item.id, scope || item.scope, Number(fee || item.fee), deadline); setScope(''); setFee(''); refresh(); }}>
                <input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="New scope" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                <input value={fee} onChange={(e) => setFee(e.target.value)} placeholder="New fee" className="border border-slate-200 rounded-xl px-3 py-2 text-xs w-24" />
                <input value={deadline} onChange={(e) => setDeadline(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs w-28" />
                <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Revise quotation</button>
              </form>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!staff.trim()) return; assignStaff(item.id, staff); setStaff(''); refresh(); }}>
                <input value={staff} onChange={(e) => setStaff(e.target.value)} placeholder="Staff email" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Assign staff</button>
              </form>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!deliverable.trim()) return; setDeliverable(item.id, deliverable); setDeliverableText(''); refresh(); }}>
                <input value={deliverable} onChange={(e) => setDeliverableText(e.target.value)} placeholder="Deliverable" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Send deliverable</button>
              </form>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!revision.trim()) return; addRevision(item.id, revision); setRevision(''); refresh(); }}>
                <input value={revision} onChange={(e) => setRevision(e.target.value)} placeholder="Ask for a revision" className="border border-slate-200 rounded-xl px-3 py-2 text-xs" />
                <button className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">Request revision</button>
              </form>
              {item.status !== 'invoiced' && item.status !== 'paid' && (
                <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100" onClick={() => { invoiceBooking(item.id); refresh(); }}>Issue invoice</button>
              )}
              {item.status === 'invoiced' && (
                <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-[#111827] text-white" onClick={() => { payBooking(item.id); refresh(); }}>Mark paid</button>
              )}
            </div>
          </article>
        ))}
      </main>
      <EnglishFooter />
    </div>
  );
}
