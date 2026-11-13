'use client';

import { useEffect, useState } from 'react';
import CourseMentorsPanel from './CourseMentorsPanel';
import TeacherPhoto from './TeacherPhoto';
import AdminModal from './AdminModal';
import { shrinkImage } from '@/lib/course-edits-client';
import type { InstructorCard } from '@/lib/instructor-cards';

const blankCard = (): InstructorCard => ({ phone: '', bio: '', university: '', degree: '' });

type Profile = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  disabled: boolean;
  mentor_level: 'lead' | 'assistant';
  created_at: string;
  has_photo?: boolean;
  card?: InstructorCard;
};
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

  const [form, setForm] = useState({ name: '', email: '', password: '', mentorLevel: 'lead', card: blankCard() });
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState('');
  const [editing, setEditing] = useState<Profile | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);

  const addInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote('');
    setAdded('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photo: photo || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setNote(data.message || 'Could not add the instructor.');
        return;
      }
      setAdded(data.photoSaved === false
        ? `${form.name} was added, but the photo was not saved. ${data.message || ''}`
        : `${form.name} was added. Open Instructor Access to choose their tools.`);
      setForm({ name: '', email: '', password: '', mentorLevel: 'lead', card: blankCard() });
      setPhoto('');
      setPhotoName('');
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
        <form onSubmit={addInstructor} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold text-slate-600">Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600">Email
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600">Password
            <input required minLength={6} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600">Phone
            <input value={form.card.phone} onChange={(e) => setForm({ ...form, card: { ...form.card, phone: e.target.value } })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600">University
            <input value={form.card.university} onChange={(e) => setForm({ ...form, card: { ...form.card, university: e.target.value } })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600">Degree
            <input value={form.card.degree} onChange={(e) => setForm({ ...form, card: { ...form.card, degree: e.target.value } })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <label className="block text-xs font-bold text-slate-600 sm:col-span-2">Short bio
            <textarea value={form.card.bio} onChange={(e) => setForm({ ...form, card: { ...form.card, bio: e.target.value } })} rows={3} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium" />
          </label>
          <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600">Mentor level
              <select aria-label="Mentor level" value={form.mentorLevel} onChange={(e) => setForm({ ...form, mentorLevel: e.target.value })} className="mt-1 block border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium">
                <option value="lead">Lead mentor</option>
                <option value="assistant">Assistant mentor</option>
              </select>
            </label>
            <div className="text-xs font-bold text-slate-600">
              Profile photo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-xs font-medium" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPhoto(await shrinkImage(file, 320));
                setPhotoName(file.name);
              }} />
              {photoName && <span className="mt-1 block font-semibold text-emerald-700">{photoName}</span>}
            </div>
            <button type="submit" disabled={adding} className="bg-[#FACC15] text-[#111827] font-extrabold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60">
              {adding ? 'Adding…' : 'Add instructor'}
            </button>
          </div>
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
                <th className="py-3 px-3">Photo</th>
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
                  <td className="py-3 px-3">
                    {profile.roles.includes('Instructor') ? (
                      <TeacherPhoto profileId={profile.id} name={profile.name} hasPhoto={Boolean(profile.has_photo)} />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    {profile.name}
                    {profile.roles.includes('Instructor') && (profile.card?.university || profile.card?.degree) && (
                      <div className="mt-0.5 font-semibold text-slate-500">{[profile.card?.degree, profile.card?.university].filter(Boolean).join(' · ')}</div>
                    )}
                  </td>
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
                  <td className="py-3 px-3 text-right space-x-2">
                    {profile.roles.includes('Instructor') && (
                      <button type="button" onClick={() => setEditing({ ...profile, card: profile.card || blankCard() })} className="font-bold px-3 py-1.5 rounded-full bg-slate-100">
                        Details
                      </button>
                    )}
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
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">No accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {note && <p className="text-sm text-rose-600">{note}</p>}
      </section>

      {editing && (
        <AdminModal title={`Details · ${editing.name}`} onClose={() => setEditing(null)}>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setSavingDetails(true);
              setNote('');
              const res = await fetch('/api/admin/accounts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId: editing.id, name: editing.name, card: editing.card || blankCard() }),
              });
              const data = await res.json().catch(() => ({}));
              setSavingDetails(false);
              if (!res.ok) {
                setNote(data.message || 'Could not save.');
                return;
              }
              setEditing(null);
              load();
            }}
          >
            <label className="block text-xs font-bold text-slate-600">Name
              <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-600">Phone
              <input value={editing.card?.phone || ''} onChange={(e) => setEditing({ ...editing, card: { ...(editing.card || blankCard()), phone: e.target.value } })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-600">University
              <input value={editing.card?.university || ''} onChange={(e) => setEditing({ ...editing, card: { ...(editing.card || blankCard()), university: e.target.value } })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-600">Degree
              <input value={editing.card?.degree || ''} onChange={(e) => setEditing({ ...editing, card: { ...(editing.card || blankCard()), degree: e.target.value } })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-bold text-slate-600">Bio
              <textarea value={editing.card?.bio || ''} onChange={(e) => setEditing({ ...editing, card: { ...(editing.card || blankCard()), bio: e.target.value } })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <button type="submit" disabled={savingDetails} className="rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{savingDetails ? 'Saving…' : 'Save details'}</button>
          </form>
        </AdminModal>
      )}

      <CourseMentorsPanel profiles={profiles} settings={courses} onChange={load} />
    </div>
  );
}
