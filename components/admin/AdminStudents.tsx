'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

type Student = { id: string; name: string; email: string; program: string; status: 'Active' | 'Paused' | 'Completed'; joinedDate: string };
const empty = { name: '', email: '', program: '', status: 'Active' as const };

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ id?: string; name: string; email: string; program: string; status: Student['status'] }>(empty);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/students').then((res) => res.json()).then((data) => setStudents(data.students || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setStudents(data.students || []);
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this student from the admin list?')) return;
    const res = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
    const data = await res.json();
    setStudents(data.students || []);
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-xl">Students ({students.length})</h2>
          <p className="text-xs text-slate-500">Add a student by hand, then edit or remove the row.</p>
        </div>
        <button type="button" onClick={() => { setDraft(empty); setNote(''); setOpen(true); }} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">Add student</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Program</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Joined</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-50">
                <td className="py-3 px-3 font-bold">{student.name}</td>
                <td className="py-3 px-3">{student.email}</td>
                <td className="py-3 px-3">{student.program}</td>
                <td className="py-3 px-3">{student.status}</td>
                <td className="py-3 px-3 text-slate-400">{student.joinedDate}</td>
                <td className="py-3 px-3 text-right">
                  <button type="button" title="Edit" onClick={() => { setDraft(student); setNote(''); setOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4 inline" /></button>
                  <button type="button" title="Delete" onClick={() => remove(student.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <AdminModal title={draft.id ? 'Edit student' : 'Add student'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <input className={fieldClass} placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <input className={fieldClass} placeholder="Program" value={draft.program} onChange={(e) => setDraft({ ...draft, program: e.target.value })} />
            <select className={fieldClass} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Student['status'] })}>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save student</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
