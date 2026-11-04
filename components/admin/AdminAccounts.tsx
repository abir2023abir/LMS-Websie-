'use client';

import { useEffect, useState } from 'react';
import CourseMentorsPanel from './CourseMentorsPanel';

type Profile = { id: string; name: string; email: string; roles: string[]; disabled: boolean; mentor_level: 'lead' | 'assistant'; created_at: string };
type GuardianLink = { id: string; guardian_id: string; student_email: string; status: 'pending' | 'approved' | 'rejected'; decided_by: string | null };
type CourseRow = { course_id: string; mentor_email: string; mentor_history: { email: string; at: string }[] };

export default function AdminAccounts() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [note, setNote] = useState('');

  const load = () =>
    fetch('/api/admin/accounts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success === false) setNote(data.message || 'Could not load accounts.');
        setProfiles(data.profiles || []);
        setLinks(data.links || []);
        setCourses(data.courses || []);
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

  const [form, setForm] = useState({ name: '', email: '', password: '', mentorLevel: 'lead' });
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState('');

  const addInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote('');
    setAdded('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setNote(data.message || 'Could not add the instructor.');
        return;
      }
      setAdded(`${form.name} was added. Open Instructor Access to choose their tools.`);
      setForm({ name: '', email: '', password: '', mentorLevel: 'lead' });
      load();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-xl">Add instructor</h2>
          <p className="text-xs text-slate-500">Creates a mentor account. Give them the email and password so they can sign in.</p>
        </div>
        <form onSubmit={addInstructor} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
          <input required minLength={6} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (6+ characters)" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm" />
          <select aria-label="Mentor level" value={form.mentorLevel} onChange={(e) => setForm({ ...form, mentorLevel: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="lead">Lead mentor</option>
            <option value="assistant">Assistant mentor</option>
          </select>
          <button type="submit" disabled={adding} className="bg-[#FACC15] text-[#111827] font-extrabold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60">
            {adding ? 'Adding…' : 'Add instructor'}
          </button>
        </form>
        {added && <p className="text-sm text-emerald-700">{added}</p>}
      </section>
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
                <th className="py-3 px-3">Mentor level</th>
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
                  <td className="py-3 px-3">
                    {profile.roles.includes('Instructor') ? (
                      <select
                        aria-label={`Mentor level for ${profile.email}`}
                        value={profile.mentor_level}
                        onChange={(e) => patch({ profileId: profile.id, mentorLevel: e.target.value })}
                        className="border border-slate-200 rounded-lg px-2 py-1"
                      >
                        <option value="lead">Lead</option>
                        <option value="assistant">Assistant</option>
                      </select>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
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
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">No accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {note && <p className="text-sm text-rose-600">{note}</p>}
      </section>

      <CourseMentorsPanel profiles={profiles} settings={courses} onChange={load} />
    </div>
  );
}
