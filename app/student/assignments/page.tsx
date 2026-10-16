'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';

type Task = { id: string; title: string; course: string; instructions: string; dueDate: string };
type Submission = { id: string; assignmentId: string; text: string; status: string; grade: string; review: string; fileName: string };

export default function StudentAssignmentsPage() {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [text, setText] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');

  const email = user?.email || '';

  const load = () => {
    if (!email) return;
    fetch(`/api/assignments?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.assignments || []);
        setSubmissions(data.submissions || []);
      });
  };

  useEffect(() => { load(); }, [email]);

  const submit = async (event: FormEvent<HTMLFormElement>, assignmentId: string) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set('assignmentId', assignmentId);
    form.set('studentName', userProfile?.name || user?.displayName || 'Student');
    form.set('email', email);
    form.set('text', text[assignmentId] || '');
    const res = await fetch('/api/assignments', { method: 'POST', body: form });
    const data = await res.json();
    setNote(res.ok ? 'Submitted. The admin can review it.' : data.message || 'Could not submit.');
    if (res.ok) load();
  };

  return (
    <AuthGuard>
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <Link href="/student" className="text-xs font-bold text-slate-500">Back to dashboard</Link>
        <h1 className="font-display font-extrabold text-3xl">Assignments</h1>
        {tasks.length === 0 ? <p className="text-sm text-slate-500">No assignments have been posted yet.</p> : tasks.map((task) => {
          const mine = submissions.filter((item) => item.assignmentId === task.id);
          return (
            <section key={task.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
              <h2 className="font-bold text-lg">{task.title}</h2>
              <p className="text-xs text-slate-500">{task.course}{task.dueDate ? ` · due ${task.dueDate}` : ''}</p>
              <p className="text-sm">{task.instructions}</p>
              {mine.map((item) => (
                <div key={item.id} className="text-xs bg-slate-50 rounded-xl p-3">
                  <div className="font-bold capitalize">{item.status}{item.grade ? ` · ${item.grade}` : ''}</div>
                  {item.text && <p className="mt-1">{item.text}</p>}
                  {item.review && <p className="mt-1 text-slate-600">Review: {item.review}</p>}
                </div>
              ))}
              <form className="space-y-2" onSubmit={(event) => submit(event, task.id)}>
                <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={3} placeholder="Write your answer" value={text[task.id] || ''} onChange={(e) => setText({ ...text, [task.id]: e.target.value })} />
                <input name="file" type="file" className="text-xs" />
                <button className="bg-[#111827] text-white text-xs font-bold px-4 py-2 rounded-full">Submit</button>
              </form>
            </section>
          );
        })}
        {note && <p className="text-sm font-semibold">{note}</p>}
      </main>
    </AuthGuard>
  );
}
