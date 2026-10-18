'use client';

import { useEffect, useState } from 'react';

type Profile = { id: string; name: string; email: string; roles: string[]; disabled: boolean; created_at: string };
type GuardianLink = { id: string; guardian_id: string; student_email: string; status: 'pending' | 'approved' | 'rejected'; decided_by: string | null };

export default function AdminAccounts() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [note, setNote] = useState('');

  const load = () =>
    fetch('/api/admin/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success === false) setNote(data.message || 'Could not load accounts.');
        setProfiles(data.profiles || []);
        setLinks(data.links || []);
      });

  useEffect(() => {
    load();
  }, []);

  const patch = async (body: object) => {
    setNote('');
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setNote(data.message || 'Could not save.');
    load();
  };

  const nameOf = (id: string) => profiles.find((item) => item.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-xl">Guardian links ({links.length})</h2>
          <p className="text-xs text-slate-500">A guardian sees nothing until the student or an admin approves.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase">
                <th className="py-3 px-3">Guardian</th>
                <th className="py-3 px-3">Student email</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-slate-50">
                  <td className="py-3 px-3 font-bold">{nameOf(link.guardian_id)}</td>
                  <td className="py-3 px-3">{link.student_email}</td>
                  <td className="py-3 px-3 capitalize">{link.status}{link.decided_by ? ` by ${link.decided_by}` : ''}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {link.status !== 'approved' && (
                      <button type="button" onClick={() => patch({ linkId: link.id, status: 'approved' })} className="font-bold px-3 py-1.5 rounded-full bg-[#FACC15]">
                        Approve
                      </button>
                    )}
                    {link.status !== 'rejected' && (
                      <button type="button" onClick={() => patch({ linkId: link.id, status: 'rejected' })} className="font-bold px-3 py-1.5 rounded-full bg-slate-100">
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">No guardian requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-xl">Accounts ({profiles.length})</h2>
          <p className="text-xs text-slate-500">A turned-off account cannot sign in.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Roles</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3 text-right">Access</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-slate-50">
                  <td className="py-3 px-3 font-bold">{profile.name}</td>
                  <td className="py-3 px-3">{profile.email}</td>
                  <td className="py-3 px-3">{profile.roles.join(', ')}</td>
                  <td className="py-3 px-3">{profile.created_at.slice(0, 10)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => patch({ profileId: profile.id, disabled: !profile.disabled })}
                      className={`font-bold px-3 py-1.5 rounded-full ${profile.disabled ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}
                    >
                      {profile.disabled ? 'Off · turn on' : 'On · turn off'}
                    </button>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-slate-400">No accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {note && <p className="text-sm text-rose-600">{note}</p>}
      </section>
    </div>
  );
}
