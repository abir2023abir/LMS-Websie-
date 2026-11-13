'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';
import { useCourseOutline } from './CoursePlacePicker';

type Certificate = {
  id: string;
  studentName: string;
  course: string;
  date: string;
  hours?: string;
  instructorName?: string;
  courseId?: string;
};

const empty = { studentName: '', course: '', courseId: '', date: new Date().toISOString().slice(0, 10), hours: '', instructorName: '' };

export default function AdminCertificates() {
  const outline = useCourseOutline();
  const [rows, setRows] = useState<Certificate[]>([]);
  const [draft, setDraft] = useState<typeof empty & { id?: string }>(empty);
  const [finished, setFinished] = useState<{ name: string; percent: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/certificates').then((res) => res.json()).then((data) => setRows(data.certificates || []));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!draft.courseId) { setFinished([]); return; }
    fetch(`/api/admin/progress?courseId=${encodeURIComponent(draft.courseId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setFinished((data.rows || []).filter((row: { percent: number }) => row.percent === 100).map((row: { name: string; percent: number }) => ({ name: row.name, percent: row.percent }))))
      .catch(() => setFinished([]));
  }, [draft.courseId]);

  const save = async () => {
    const res = await fetch('/api/admin/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setRows(data.certificates || []);
    setOpen(false);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Certificates ({rows.length})</h2>
          <p className="text-xs text-slate-500">Issues a print-ready PDF with the student, course, hours, instructor, certificate ID, signatures, and a verification link.</p>
        </div>
        <button type="button" onClick={() => { setDraft(empty); setNote(''); setOpen(true); }} className="rounded-full bg-[#FACC15] px-4 py-2 text-xs font-bold text-[#111827]">Issue certificate</button>
      </div>
      {rows.length === 0 ? <p className="text-sm text-slate-500">No certificates yet.</p> : (
        <table className="w-full text-left text-xs">
          <thead><tr className="border-b uppercase text-slate-400"><th className="py-2">ID</th><th>Student</th><th>Course</th><th>Date</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="py-3 font-bold">{row.id}</td>
                <td>{row.studentName}</td>
                <td>{row.course}</td>
                <td>{row.date}</td>
                <td className="space-x-2 text-right">
                  <a className="text-xs font-bold underline" href={`/api/admin/certificates/pdf?id=${encodeURIComponent(row.id)}`} target="_blank" rel="noreferrer">PDF</a>
                  <button type="button" title="Edit" onClick={() => { setDraft({ ...empty, ...row }); setOpen(true); }} className="p-1.5"><Pencil className="w-4 h-4 inline" /></button>
                  <button type="button" title="Delete" onClick={async () => {
                    if (!confirm('Delete this certificate?')) return;
                    const res = await fetch('/api/admin/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: row.id }) });
                    const data = await res.json();
                    setRows(data.certificates || []);
                  }} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {open && (
        <AdminModal title={draft.id ? 'Edit certificate' : 'Issue certificate'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600">Course
              <select className={`${fieldClass} mt-1`} value={draft.courseId} onChange={(e) => {
                const course = outline.find((item) => item.id === e.target.value);
                setDraft({ ...draft, courseId: e.target.value, course: course?.title || draft.course });
              }}>
                <option value="">Choose a course</option>
                {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-600">Student who finished
              <select className={`${fieldClass} mt-1`} value={finished.some((row) => row.name === draft.studentName) ? draft.studentName : ''} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })}>
                <option value="">{finished.length ? 'Choose a student' : 'No one is at 100% yet — type the name below'}</option>
                {finished.map((row) => <option key={row.name} value={row.name}>{row.name}</option>)}
              </select>
            </label>
            <input className={fieldClass} placeholder="Student full name" value={draft.studentName} onChange={(e) => setDraft({ ...draft, studentName: e.target.value })} />
            <input className={fieldClass} placeholder="Course name" value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
            <input className={fieldClass} placeholder="Duration, for example 20 hours" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} />
            <input className={fieldClass} placeholder="Instructor name" value={draft.instructorName} onChange={(e) => setDraft({ ...draft, instructorName: e.target.value })} />
            <input className={fieldClass} type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white">Save certificate</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
