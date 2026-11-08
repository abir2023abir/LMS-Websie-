'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardList, Paperclip, Send } from 'lucide-react';

type Submission = { id: string; text: string; fileName: string; status: 'submitted' | 'needs-changes' | 'graded'; score: number | null; feedback: string; late: boolean; submittedAt: string };
type Assignment = { id: string; title: string; instructions: string; dueDate: string; maxScore: number; allowFile: boolean; submission: Submission | null };

const day = (value: string) => (value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** The assignments attached to one lesson, with the student's submission, score and feedback. */
export default function LessonAssignment({ courseId, lessonId, onChanged }: { courseId: string; lessonId: string; onChanged?: () => void }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState('');

  const load = () => fetch(`/api/assignments?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || data.locked) { setMessage(data.message || 'Could not load assignments.'); setAssignments([]); return; }
      setMessage('');
      setAssignments(data.assignments || []);
    })
    .catch(() => setMessage('Could not load assignments.'))
    .finally(() => setLoading(false));

  useEffect(() => { setLoading(true); setEditing({}); void load(); }, [courseId, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (assignment: Assignment) => {
    setSending(assignment.id);
    setMessage('');
    try {
      const form = new FormData();
      form.set('assignmentId', assignment.id);
      form.set('text', texts[assignment.id] ?? assignment.submission?.text ?? '');
      const file = files[assignment.id];
      if (file) form.set('file', file);
      const res = await fetch('/api/assignments', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not submit.');
      setEditing((prev) => ({ ...prev, [assignment.id]: false }));
      setFiles((prev) => ({ ...prev, [assignment.id]: null }));
      await load();
      onChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit.');
    } finally {
      setSending('');
    }
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-500">Loading assignment…</p>;
  if (message && assignments.length === 0) return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">{message}</p>;
  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <ClipboardList className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        There is no assignment for this lesson.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{message}</p>}
      {assignments.map((assignment) => {
        const submission = assignment.submission;
        const open = !submission || editing[assignment.id];
        const overdue = assignment.dueDate && new Date().toISOString().slice(0, 10) > assignment.dueDate;
        return (
          <div key={assignment.id} className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-bold text-[#111827]">{assignment.title}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                  <span>{assignment.maxScore} marks</span>
                  {assignment.dueDate && <span className={`flex items-center gap-1 ${overdue && !submission ? 'font-bold text-rose-600' : ''}`}><CalendarDays className="h-3 w-3" />Due {day(assignment.dueDate)}{overdue && !submission ? ' — overdue' : ''}</span>}
                </p>
              </div>
              {submission && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${submission.status === 'graded' ? 'bg-emerald-50 text-emerald-700' : submission.status === 'needs-changes' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}`}>
                  {submission.status === 'graded' ? `Score ${submission.score}/${assignment.maxScore}` : submission.status === 'needs-changes' ? 'Changes requested' : 'Submitted — waiting for review'}
                </span>
              )}
            </div>

            <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{assignment.instructions}</div>

            {submission?.feedback && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-emerald-700">Mentor feedback</p>
                <p className="whitespace-pre-wrap text-emerald-900">{submission.feedback}</p>
              </div>
            )}

            {open ? (
              <div className="space-y-3">
                <textarea
                  value={texts[assignment.id] ?? submission?.text ?? ''}
                  onChange={(e) => setTexts((prev) => ({ ...prev, [assignment.id]: e.target.value }))}
                  rows={6}
                  placeholder="Write your answer here…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {assignment.allowFile ? (
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <Paperclip className="h-3.5 w-3.5" />{files[assignment.id]?.name || submission?.fileName || 'Attach a file (optional, up to 4 MB)'}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,image/*" onChange={(e) => setFiles((prev) => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))} />
                    </label>
                  ) : <span />}
                  <button type="button" onClick={() => submit(assignment)} disabled={sending === assignment.id} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-50">
                    <Send className="h-4 w-4" />{sending === assignment.id ? 'Submitting…' : submission ? 'Submit again' : 'Submit assignment'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Your submission · {day(submission.submittedAt)}{submission.late ? ' · late' : ''}</p>
                {submission.text && <p className="whitespace-pre-wrap text-slate-700">{submission.text}</p>}
                {submission.fileName && <p className="flex items-center gap-1.5 text-xs text-slate-600"><Paperclip className="h-3.5 w-3.5" />{submission.fileName}</p>}
                {submission.status !== 'graded' && (
                  <button type="button" onClick={() => setEditing((prev) => ({ ...prev, [assignment.id]: true }))} className="text-xs font-bold text-amber-700 hover:underline">Edit and resubmit</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
