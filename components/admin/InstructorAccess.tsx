'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PANEL_TABS } from '@/lib/panel-tabs';

type Profile = { id: string; email: string; name: string; roles?: string[] };

export default function InstructorAccess() {
  const [people, setPeople] = useState<Profile[]>([]);
  const [access, setAccess] = useState<Record<string, string[]>>({});
  const [picked, setPicked] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/accounts').then((res) => res.json()),
      fetch('/api/admin/instructor-access').then((res) => res.json()),
    ]).then(([accounts, saved]) => {
      const instructors = (accounts.profiles || []).filter((item: Profile) => item.roles?.includes('Instructor'));
      setPeople(instructors);
      setAccess(saved.access || {});
      setPicked((current) => current || instructors[0]?.email || '');
    }).catch(() => toast.error('Could not load instructors'));
  }, []);

  const tabs = access[picked.toLowerCase()] || [];
  const toggle = (tab: string) => {
    const email = picked.toLowerCase();
    const next = tabs.includes(tab) ? tabs.filter((item) => item !== tab) : [...tabs, tab];
    setAccess((prev) => ({ ...prev, [email]: next }));
  };

  const save = async () => {
    if (!picked) return;
    setBusy(true);
    const res = await fetch('/api/admin/instructor-access', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: picked, tabs }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.success) {
      toast.error(data.message || 'Could not save');
      return;
    }
    toast.success('Instructor tools updated');
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-xl font-extrabold text-slate-900">Instructor tools</h2>
        <p className="mt-1 text-sm text-slate-500">Tick the admin-panel options this instructor can open. Unticked options stay hidden on their instructor panel.</p>
      </div>
      {people.length === 0 ? (
        <p className="text-sm text-slate-500">No instructor accounts yet. Create one from Internal signup, then come back here.</p>
      ) : (
        <>
          <label className="block text-xs font-bold text-slate-500">
            Instructor
            <select value={picked} onChange={(e) => setPicked(e.target.value)} className="mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
              {people.map((person) => (
                <option key={person.id} value={person.email}>{person.name} · {person.email}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PANEL_TABS.map((tab) => (
              <label key={tab} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
                <input type="checkbox" checked={tabs.includes(tab)} onChange={() => toggle(tab)} />
                {tab}
              </label>
            ))}
          </div>
          <button type="button" disabled={busy} onClick={save} className="rounded-full bg-[#111827] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Save instructor tools'}
          </button>
        </>
      )}
    </div>
  );
}
