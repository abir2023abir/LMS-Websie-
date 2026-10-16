'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

type Task = { id: string; title: string; course: string; instructions: string; dueDate: string };
type Submission = {
  id: string;
  assignmentId: string;
  studentName: string;
  email: string;
  text: string;
  fileName: string;
  storedFile: string;
  status: 'submitted' | 'reviewed' | 'graded';
  grade: string;
  review: string;
  submittedAt: string;
};

const empty = { title: '', course: '', instructions: '', dueDate: '' };

export default function AdminAssignments() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [draft, setDraft] = useState<typeof empty & { id?: string }>(empty);
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState<Submission | null>(null);
  const [note, setNote] = useState('');

  const load = () => fetch('/api/admin/assignments').then((res) => res.json()).then((data) => {
    setTasks(data.assignments || []);
    setSubmissions(data.submissions || []);
  });
  useEffect(() => { load(); }, []);

  const saveTask = async () => {
    const res = await fetch('/api/admin/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Save failed.'); return; }
    setTasks(data.assignments || []);
    setSubmissions(data.submissions || []);
    setOpen(false);
  };

  const saveReview = async () => {
    if (!review) return;
    const res = await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', id: review.id, status: review.status, grade: review.grade, review: review.review }),
    });
    const data = await res.json();
    if (!res.ok) { setNote(data.message || 'Review failed.'); return; }
    setTasks(data.assignments || []);
    setSubmissions(data.submissions || []);
    setReview(null);
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-xl">Assignments ({tasks.length})</h2>
            <p className="text-xs text-slate-500">Students see these on their Assignments page and can send text or a file.</p>
          </div>
          <button type="button" onClick={() => { setDraft(empty); setNote(''); setOpen(true); }} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">New assignment</button>
        </div>
        {tasks.length === 0 ? <p className="text-sm text-slate-500">No assignments yet.</p> : (
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b text-slate-400 uppercase"><th className="py-2">Title</th><th>Course</th><th>Due</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-50">
                  <td className="py-3 font-bold">{task.title}</td>
                  <td>{task.course}</td>
                  <td>{task.dueDate || '—'}</td>
                  <td className="text-right">
                    <button type="button" title="Edit" onClick={() => { setDraft(task); setOpen(true); }} className="p-1.5"><Pencil className="w-4 h-4 inline" /></button>
                    <button type="button" title="Delete" onClick={async () => {
                      if (!confirm('Delete this assignment and its submissions?')) return;
                      const res = await fetch('/api/admin/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id: task.id }) });
                      const data = await res.json();
                      setTasks(data.assignments || []);
                      setSubmissions(data.submissions || []);
                    }} className="p-1.5 text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
        <h3 className="font-display font-bold">Submissions ({submissions.length})</h3>
        {submissions.length === 0 ? <p className="text-sm text-slate-500">No submissions yet.</p> : submissions.map((item) => {
          const task = tasks.find((row) => row.id === item.assignmentId);
          return (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-slate-100 rounded-2xl p-3 text-sm">
              <div>
                <div className="font-bold">{item.studentName} · {task?.title || 'Assignment'}</div>
                <div className="text-xs text-slate-500">{item.email} · {item.status}{item.grade ? ` · ${item.grade}` : ''}</div>
                {item.text && <p className="text-xs mt-1 text-slate-600">{item.text}</p>}
              </div>
              <div className="flex items-center gap-2">
                {item.storedFile && <a className="text-xs font-bold underline" href={`/api/admin/assignments?file=${encodeURIComponent(item.storedFile)}`}>File</a>}
                <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100" onClick={() => setReview(item)}>Review</button>
              </div>
            </div>
          );
        })}
      </div>
      {note && <p className="text-sm text-rose-600">{note}</p>}
      {open && (
        <AdminModal title={draft.id ? 'Edit assignment' : 'New assignment'} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <input className={fieldClass} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <input className={fieldClass} placeholder="Course" value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} />
            <textarea className={fieldClass} rows={4} placeholder="Instructions" value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} />
            <input className={fieldClass} type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
            <button type="button" onClick={saveTask} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save assignment</button>
          </div>
        </AdminModal>
      )}
      {review && (
        <AdminModal title="Review submission" onClose={() => setReview(null)}>
          <div className="space-y-3">
            <p className="text-sm">{review.text || 'No written answer.'}</p>
            <select className={fieldClass} value={review.status} onChange={(e) => setReview({ ...review, status: e.target.value as Submission['status'] })}>
              <option value="submitted">submitted</option>
              <option value="reviewed">reviewed</option>
              <option value="graded">graded</option>
            </select>
            <input className={fieldClass} placeholder="Grade, for example 8/10" value={review.grade} onChange={(e) => setReview({ ...review, grade: e.target.value })} />
            <textarea className={fieldClass} rows={3} placeholder="Review note" value={review.review} onChange={(e) => setReview({ ...review, review: e.target.value })} />
            <button type="button" onClick={saveReview} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save review</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
