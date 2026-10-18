'use client';

import { useEffect, useState } from 'react';
import { featuredCourses } from '@/lib/data';

type Profile = { id: string; name: string; email: string; roles: string[]; disabled: boolean; mentor_level: 'lead' | 'assistant'; created_at: string };
type GuardianLink = { id: string; guardian_id: string; student_email: string; status: 'pending' | 'approved' | 'rejected'; decided_by: string | null };
type CourseRow = { course_id: string; mentor_email: string; mentor_history: { email: string; at: string }[] };

export default function AdminAccounts() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [courseId, setCourseId] = useState(String(featuredCourses[0]?.id || ''));
  const [mentorEmail, setMentorEmail] = useState('');
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

  const mentors = profiles.filter((item) => item.roles.includes('Instructor'));
  const courseTitle = (id: string) => featuredCourses.find((item) => String(item.id) === id)?.title || id;

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

      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="font-display font-extrabold text-xl">Course mentors</h2>
          <p className="text-xs text-slate-500">
            Changing a mentor keeps the old mentor in the history. Grades and messages belong to the student, so nothing is lost.
          </p>
        </div>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (mentorEmail) patch({ courseId, mentorEmail });
          }}
        >
          <select aria-label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs">
            {featuredCourses.map((course) => (
              <option key={course.id} value={String(course.id)}>{course.title}</option>
            ))}
          </select>
          <select aria-label="Mentor" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <option value="">Pick a mentor</option>
            {mentors.map((item) => (
              <option key={item.id} value={item.email}>{item.name} · {item.mentor_level}</option>
            ))}
          </select>
          <button className="text-xs font-bold px-4 py-2 rounded-full bg-[#FACC15]">Assign mentor</button>
        </form>
        {mentors.length === 0 && <p className="text-xs text-slate-500">No mentor accounts yet. A mentor signs up with the Mentor role.</p>}
        <div className="space-y-2">
          {courses.filter((row) => row.mentor_email).map((row) => (
            <p key={row.course_id} className="text-xs">
              <span className="font-bold">{courseTitle(row.course_id)}</span>: {row.mentor_email}
              {row.mentor_history.length > 1 && (
                <span className="text-slate-500"> · before: {row.mentor_history.slice(1).map((item) => item.email).join(', ')}</span>
              )}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
