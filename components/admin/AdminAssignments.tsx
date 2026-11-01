'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronRight, ClipboardList, Download, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import CoursePlacePicker, { useCourseOutline, type Place } from './CoursePlacePicker';

type Assignment = Place & {
  id?: string; title: string; instructions: string; dueDate: string; maxScore: number; allowFile: boolean; published: boolean;
};
type Submission = {
  id: string; assignmentId: string; studentName: string; studentEmail: string; text: string; fileId: string; fileName: string;
  late: boolean; status: 'submitted' | 'needs-changes' | 'graded'; score: number | null; feedback: string; submittedAt: string;
};

const blank = (): Assignment => ({ courseId: '', courseTitle: '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '', title: '', instructions: '', dueDate: '', maxScore: 100, allowFile: true, published: true });
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';
const statusStyle: Record<Submission['status'], string> = { submitted: 'bg-amber-50 text-amber-800', 'needs-changes': 'bg-sky-50 text-sky-800', graded: 'bg-emerald-50 text-emerald-700' };
const statusLabel: Record<Submission['status'], string> = { submitted: 'To review', 'needs-changes': 'Needs changes', graded: 'Graded' };
const day = (value: string) => (value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function AdminAssignments() {
  const outline = useCourseOutline();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'assignments' | 'submissions'>('assignments');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Submission['status']>('submitted');
  const [draft, setDraft] = useState<Assignment | null>(null);
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const apply = (data: { assignments?: Assignment[]; submissions?: Submission[] }) => {
    setAssignments(data.assignments || []);
    setSubmissions(data.submissions || []);
  };

  useEffect(() => {
    fetch('/api/admin/assignments', { cache: 'no-store' }).then((res) => res.json()).then(apply)
      .catch(() => toast.error('Could not load assignments')).finally(() => setLoading(false));
  }, []);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setNote('');
    try {
      const res = await fetch('/api/admin/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      apply(data);
      return true;
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const assignmentOf = (id: string) => assignments.find((item) => item.id === id);
  const toReview = submissions.filter((item) => item.status === 'submitted').length;
  const visibleAssignments = assignments.filter((item) => courseFilter === 'all' || item.courseId === courseFilter);
  const grouped = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    visibleAssignments.forEach((item) => map.set(item.courseTitle || item.courseId, [...(map.get(item.courseTitle || item.courseId) || []), item]));
    return [...map.entries()];
  }, [visibleAssignments]);
  const visibleSubmissions = submissions.filter((item) => (statusFilter === 'all' || item.status === statusFilter)
    && (courseFilter === 'all' || assignmentOf(item.assignmentId)?.courseId === courseFilter));

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-extrabold">Assignments</h2>
          <p className="text-sm text-slate-500">Each assignment sits inside a course → module → lesson. Students answer from that lesson with text or a file; you review, score and give feedback.</p>
        </div>
        <button type="button" onClick={() => { setNote(''); setDraft(blank()); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />New assignment</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
          <button type="button" onClick={() => setTab('assignments')} className={`rounded-lg px-3 py-1.5 ${tab === 'assignments' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Assignments ({assignments.length})</button>
          <button type="button" onClick={() => setTab('submissions')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${tab === 'submissions' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
            Submissions{toReview > 0 && <span className="rounded-full bg-[#FACC15] px-1.5 text-[11px] text-[#111827]">{toReview}</span>}
          </button>
        </div>
        <select aria-label="Filter by course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="all">All courses</option>
          {outline.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        {tab === 'submissions' && (
          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="submitted">To review</option>
            <option value="needs-changes">Needs changes</option>
            <option value="graded">Graded</option>
            <option value="all">All</option>
          </select>
        )}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
      ) : tab === 'assignments' ? (
        visibleAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 font-semibold text-slate-700">No assignments yet</p>
            <p className="text-sm text-slate-500">Press “New assignment”, choose a course, module and lesson, and write the task.</p>
          </div>
        ) : grouped.map(([courseTitle, items]) => (
          <div key={courseTitle} className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><BookOpen className="h-4 w-4 text-amber-600" />{courseTitle}</h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {items.map((item) => {
                const subs = submissions.filter((submission) => submission.assignmentId === item.id);
                const pending = subs.filter((submission) => submission.status === 'submitted').length;
                return (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500">{item.moduleTitle}<ChevronRight className="h-3 w-3 shrink-0" />{item.lessonTitle}</p>
                      <p className="truncate font-bold text-slate-900">{item.title}</p>
                      <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                        <span>{item.maxScore} marks</span>
                        {item.dueDate && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />Due {day(item.dueDate)}</span>}
                        <span>{subs.length} submission{subs.length === 1 ? '' : 's'}{pending ? ` · ${pending} to review` : ''}</span>
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${item.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.published ? 'Published' : 'Draft'}</span>
                    {pending > 0 && <button type="button" onClick={() => { setTab('submissions'); setStatusFilter('submitted'); }} className="rounded-lg bg-[#FEF9C3] px-2.5 py-1.5 text-xs font-bold text-[#A16207]">Review</button>}
                    <button type="button" onClick={() => { setNote(''); setDraft({ ...item }); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={async () => { if (confirm('Delete this assignment? Submissions stay in the records.') && await post({ action: 'delete', id: item.id })) toast.success('Assignment deleted'); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : visibleSubmissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">No submissions here.</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {visibleSubmissions.map((item) => {
            const assignment = assignmentOf(item.assignmentId);
            return (
              <button key={item.id} type="button" onClick={() => { setNote(''); setReviewing({ ...item }); }} className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-slate-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-[#FACC15]">{item.studentName.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">{item.studentName}</p>
                  <p className="truncate text-xs text-slate-500">{assignment?.title || 'Deleted assignment'} · {assignment?.courseTitle}</p>
                </div>
                {item.late && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">Late</span>}
                {item.fileName && <FileText className="h-4 w-4 text-slate-400" />}
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyle[item.status]}`}>{item.status === 'graded' ? `${item.score}/${assignment?.maxScore ?? '?'}` : statusLabel[item.status]}</span>
                <span className="text-[11px] text-slate-400">{day(item.submittedAt)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Create / edit assignment ── */}
      {draft && (
        <AdminModal wide title={draft.id ? 'Edit assignment' : 'New assignment'} onClose={() => setDraft(null)}>
          <div className="space-y-4">
            <CoursePlacePicker outline={outline} value={draft} onChange={(place) => setDraft({ ...draft, ...place, title: draft.title || (place.lessonTitle ? `${place.lessonTitle} — Assignment` : '') })} />
            <label className="block"><span className={labelClass}>Title</span><input className={fieldClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Record five transactions in a journal" /></label>
            <label className="block"><span className={labelClass}>Instructions</span><textarea className={fieldClass} rows={6} value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} placeholder="Explain what students must do and how it will be marked." /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label><span className={labelClass}>Due date (optional)</span><input type="date" className={fieldClass} value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /></label>
              <label><span className={labelClass}>Total marks</span><input type="number" min={1} className={fieldClass} value={draft.maxScore} onChange={(e) => setDraft({ ...draft, maxScore: Number(e.target.value) })} /></label>
            </div>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.allowFile} onChange={(e) => setDraft({ ...draft, allowFile: e.target.checked })} />Students may attach a file (PDF, Word, Excel, image, ZIP — up to 4 MB)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Published — students can see and submit it</label>
            </div>
            {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" disabled={saving} onClick={async () => { if (await post(draft as unknown as Record<string, unknown>)) { toast.success('Assignment saved'); setDraft(null); } }} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save assignment'}</button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── Review a submission ── */}
      {reviewing && (() => {
        const assignment = assignmentOf(reviewing.assignmentId);
        return (
          <AdminModal wide title={`Review: ${reviewing.studentName}`} onClose={() => setReviewing(null)}>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-bold">{assignment?.title || 'Deleted assignment'}</p>
                <p className="text-xs text-slate-500">{assignment?.courseTitle} · {assignment?.moduleTitle} · {assignment?.lessonTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{reviewing.studentEmail} · submitted {day(reviewing.submittedAt)}{reviewing.late ? ' · late' : ''}</p>
              </div>
              {reviewing.text && <div className="whitespace-pre-wrap rounded-2xl border border-slate-200 p-4 text-sm text-slate-800">{reviewing.text}</div>}
              {reviewing.fileName && (
                <a href={`/api/admin/assignments?file=${encodeURIComponent(reviewing.fileId)}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  <Download className="h-4 w-4" />{reviewing.fileName}
                </a>
              )}
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <label><span className={labelClass}>Decision</span>
                  <select className={fieldClass} value={reviewing.status} onChange={(e) => setReviewing({ ...reviewing, status: e.target.value as Submission['status'] })}>
                    <option value="graded">Grade it</option>
                    <option value="needs-changes">Ask for changes</option>
                    <option value="submitted">Leave to review later</option>
                  </select>
                </label>
                <label><span className={labelClass}>Score / {assignment?.maxScore ?? 100}</span>
                  <input type="number" min={0} max={assignment?.maxScore ?? 100} disabled={reviewing.status !== 'graded'} className={fieldClass} value={reviewing.score ?? ''} onChange={(e) => setReviewing({ ...reviewing, score: e.target.value === '' ? null : Number(e.target.value) })} />
                </label>
              </div>
              <label className="block"><span className={labelClass}>Feedback for the student</span><textarea className={fieldClass} rows={4} value={reviewing.feedback} onChange={(e) => setReviewing({ ...reviewing, feedback: e.target.value })} placeholder="What was good, and what to improve" /></label>
              {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewing(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="button" disabled={saving} onClick={async () => { if (await post({ action: 'review', id: reviewing.id, status: reviewing.status, score: reviewing.score, feedback: reviewing.feedback })) { toast.success('Review saved'); setReviewing(null); } }} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save review'}</button>
              </div>
            </div>
          </AdminModal>
        );
      })()}
    </section>
  );
}
