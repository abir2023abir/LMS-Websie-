'use client';

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

type Request = { id: string; guardian_name: string; status: 'pending' | 'approved' | 'rejected' };

export default function GuardianRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [note, setNote] = useState('');

  const load = () =>
    fetch('/api/guardian/links')
      .then((res) => res.json())
      .then((data) => setRequests(data.incoming || []))
      .catch(() => setRequests([]));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setNote('');
    const res = await fetch('/api/guardian/links', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setNote(data.message || 'Could not save.');
    load();
  };

  if (requests.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
      <h2 className="font-bold flex items-center gap-2">
        <Shield className="w-4 h-4 text-amber-600" /> Guardian access
      </h2>
      {requests.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            <span className="font-bold">{item.guardian_name}</span> wants to see your progress.
          </span>
          {item.status === 'pending' ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => decide(item.id, 'approved')} className="text-xs font-bold px-3 py-2 rounded-full bg-[#FACC15]">
                Approve
              </button>
              <button type="button" onClick={() => decide(item.id, 'rejected')} className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100">
                Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${item.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
              <button
                type="button"
                onClick={() => decide(item.id, item.status === 'approved' ? 'rejected' : 'approved')}
                className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100"
              >
                {item.status === 'approved' ? 'Remove access' : 'Approve'}
              </button>
            </div>
          )}
        </div>
      ))}
      {note && <p className="text-sm text-rose-600">{note}</p>}
    </section>
  );
}
