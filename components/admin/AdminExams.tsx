'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, BookOpen, CheckCircle2, Clock, Download, GraduationCap, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import CoursePlacePicker, { useCourseOutline, type Place } from './CoursePlacePicker';

type Question = { id?: string; prompt: string; choices: string[]; correctIndex: number; points: number; explanation: string };
type Exam = Place & {
  id?: string; title: string; description: string; durationMinutes: number; opensAt: string; closesAt: string;
  passMark: number; maxAttempts: number; shuffle: boolean; showAnswers: boolean; published: boolean; questions: Question[];
};
type Attempt = {
  id: string; examId: string; studentName: string; studentEmail: string; startedAt: string; submittedAt: string;
  score: number; total: number; percent: number; passed: boolean; status: 'in-progress' | 'submitted';
};

const blankQuestion = (): Question => ({ prompt: '', choices: ['', '', '', ''], correctIndex: 0, points: 1, explanation: '' });
const blankExam = (): Exam => ({
  courseId: '', courseTitle: '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '',
  title: '', description: '', durationMinutes: 30, opensAt: '', closesAt: '', passMark: 60, maxAttempts: 1,
  shuffle: true, showAnswers: false, published: false, questions: [blankQuestion()],
});
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

// <input type="datetime-local"> works in local time; exams store ISO strings.
const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : '');
const when = (iso: string) => (iso ? new Date(iso).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');

function windowOf(exam: Exam) {
  const now = new Date();
  if (!exam.published) return { label: 'Draft', tone: 'bg-slate-100 text-slate-600' };
  if (exam.opensAt && now < new Date(exam.opensAt)) return { label: `Opens ${when(exam.opensAt)}`, tone: 'bg-sky-50 text-sky-800' };
  if (exam.closesAt && now > new Date(exam.closesAt)) return { label: 'Closed', tone: 'bg-slate-100 text-slate-600' };
  return { label: 'Open now', tone: 'bg-emerald-50 text-emerald-700' };
}

export default function AdminExams() {
  const outline = useCourseOutline();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all');
  const [draft, setDraft] = useState<Exam | null>(null);
  const [results, setResults] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const apply = (data: { exams?: Exam[]; attempts?: Attempt[] }) => { setExams(data.exams || []); setAttempts(data.attempts || []); };

  useEffect(() => {
    fetch('/api/admin/exams', { cache: 'no-store' }).then((res) => res.json()).then(apply)
      .catch(() => toast.error('Could not load exams')).finally(() => setLoading(false));
  }, []);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setNote('');
    try {
      const res = await fetch('/api/admin/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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

  const visible = exams.filter((exam) => courseFilter === 'all' || exam.courseId === courseFilter);
  const grouped = useMemo(() => {
    const map = new Map<string, Exam[]>();
    visible.forEach((exam) => map.set(exam.courseTitle || exam.courseId, [...(map.get(exam.courseTitle || exam.courseId) || []), exam]));
    return [...map.entries()];
  }, [visible]);

  const statsFor = (examId?: string) => {
    const done = attempts.filter((attempt) => attempt.examId === examId && attempt.status === 'submitted');
    return {
      count: done.length,
      average: done.length ? Math.round(done.reduce((sum, attempt) => sum + attempt.percent, 0) / done.length) : null,
      passRate: done.length ? Math.round((done.filter((attempt) => attempt.passed).length / done.length) * 100) : null,
      live: attempts.filter((attempt) => attempt.examId === examId && attempt.status === 'in-progress').length,
    };
  };

  const setQuestion = (index: number, patch: Partial<Question>) => draft && setDraft({ ...draft, questions: draft.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)) });
  const totalPoints = draft?.questions.reduce((sum, question) => sum + (Number(question.points) || 0), 0) || 0;

  const exportCsv = (exam: Exam) => {
    const rows = attempts.filter((attempt) => attempt.examId === exam.id && attempt.status === 'submitted');
    const csv = [['Student', 'Email', 'Score', 'Total', 'Percent', 'Result', 'Submitted'].join(','),
      ...rows.map((attempt) => [attempt.studentName, attempt.studentEmail, attempt.score, attempt.total, `${attempt.percent}%`, attempt.passed ? 'Passed' : 'Failed', attempt.submittedAt].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `${exam.title.replace(/[^a-z0-9]+/gi, '-')}-results.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-extrabold">Exams</h2>
          <p className="text-sm text-slate-500">Timed exams for a whole course, a module or a lesson. Set when it opens and closes, the time limit and attempts — marking is automatic.</p>
        </div>
        <button type="button" onClick={() => { setNote(''); setDraft(blankExam()); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />New exam</button>
      </div>

      {outline.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button type="button" onClick={() => setCourseFilter('all')} className={`shrink-0 rounded-full px-3 py-1.5 ${courseFilter === 'all' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>All courses ({exams.length})</button>
          {outline.map((course) => (
            <button key={course.id} type="button" onClick={() => setCourseFilter(course.id)} className={`shrink-0 rounded-full px-3 py-1.5 ${courseFilter === course.id ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>
              {course.title} ({exams.filter((exam) => exam.courseId === course.id).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading exams…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-semibold text-slate-700">No exams yet</p>
          <p className="text-sm text-slate-500">Press “New exam”, choose the course (and optionally a module or lesson), set the time and add questions.</p>
        </div>
      ) : grouped.map(([courseTitle, items]) => (
        <div key={courseTitle} className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><BookOpen className="h-4 w-4 text-amber-600" />{courseTitle}</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((exam) => {
              const state = windowOf(exam);
              const stats = statsFor(exam.id);
              return (
                <article key={exam.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-500">{exam.lessonTitle ? `${exam.moduleTitle} · ${exam.lessonTitle}` : exam.moduleTitle || 'Whole course'}</p>
                      <p className="font-bold text-slate-900">{exam.title}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${state.tone}`}>{state.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.durationMinutes} min</span>
                    <span>{exam.questions.length} questions · {exam.questions.reduce((sum, question) => sum + question.points, 0)} marks</span>
                    <span>Pass {exam.passMark}%</span>
                    <span>{exam.maxAttempts ? `${exam.maxAttempts} attempt${exam.maxAttempts > 1 ? 's' : ''}` : 'Unlimited attempts'}</span>
                    {exam.closesAt && <span>Closes {when(exam.closesAt)}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center">
                    <div><p className="font-display text-lg font-extrabold">{stats.count}</p><p className="text-[10px] font-semibold text-slate-500">taken</p></div>
                    <div><p className="font-display text-lg font-extrabold">{stats.average ?? '—'}{stats.average !== null ? '%' : ''}</p><p className="text-[10px] font-semibold text-slate-500">average</p></div>
                    <div><p className="font-display text-lg font-extrabold">{stats.passRate ?? '—'}{stats.passRate !== null ? '%' : ''}</p><p className="text-[10px] font-semibold text-slate-500">passed</p></div>
                  </div>
                  <div className="mt-auto flex items-center gap-1">
                    <button type="button" onClick={() => setResults(exam)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF9C3] px-3 py-1.5 text-xs font-bold text-[#A16207]"><BarChart3 className="h-3.5 w-3.5" />Results{stats.live ? ` · ${stats.live} taking now` : ''}</button>
                    <span className="flex-1" />
                    <button type="button" onClick={() => { setNote(''); setDraft({ ...exam, questions: exam.questions.map((q) => ({ ...q, choices: [...q.choices] })) }); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={async () => { if (confirm('Delete this exam? Past results are kept.') && await post({ action: 'delete', id: exam.id })) toast.success('Exam deleted'); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Exam builder ── */}
      {draft && (
        <AdminModal wide title={draft.id ? 'Edit exam' : 'New exam'} onClose={() => setDraft(null)}>
          <div className="space-y-5">
            <CoursePlacePicker depth="course" outline={outline} value={draft} onChange={(place) => setDraft({ ...draft, ...place })} />

            <div className="space-y-3">
              <label className="block"><span className={labelClass}>Exam title</span><input className={fieldClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Bookkeeping Final Exam" /></label>
              <label className="block"><span className={labelClass}>Instructions for students (optional)</span><textarea className={fieldClass} rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Rules, what to prepare, how marks work…" /></label>
            </div>

            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label><span className={labelClass}>Time limit (min)</span><input type="number" min={1} className={fieldClass} value={draft.durationMinutes} onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })} /></label>
              <label><span className={labelClass}>Pass mark %</span><input type="number" min={0} max={100} className={fieldClass} value={draft.passMark} onChange={(e) => setDraft({ ...draft, passMark: Number(e.target.value) })} /></label>
              <label><span className={labelClass}>Attempts (0 = no limit)</span><input type="number" min={0} className={fieldClass} value={draft.maxAttempts} onChange={(e) => setDraft({ ...draft, maxAttempts: Number(e.target.value) })} /></label>
              <div className="flex items-end"><p className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700">Total: {totalPoints} marks</p></div>
              <label className="sm:col-span-2"><span className={labelClass}>Opens (optional)</span><input type="datetime-local" className={fieldClass} value={toLocalInput(draft.opensAt)} onChange={(e) => setDraft({ ...draft, opensAt: fromLocalInput(e.target.value) })} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Closes (optional)</span><input type="datetime-local" className={fieldClass} value={toLocalInput(draft.closesAt)} onChange={(e) => setDraft({ ...draft, closesAt: fromLocalInput(e.target.value) })} /></label>
            </div>

            <div className="space-y-3">
              {draft.questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-slate-800">Question {qIndex + 1}</span>
                    <span className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs font-semibold text-slate-500">Marks<input type="number" min={1} className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-sm" value={question.points} onChange={(e) => setQuestion(qIndex, { points: Number(e.target.value) })} /></label>
                      {draft.questions.length > 1 && <button type="button" onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== qIndex) })} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Remove question"><Trash2 className="h-4 w-4" /></button>}
                    </span>
                  </div>
                  <textarea className={fieldClass} rows={2} value={question.prompt} onChange={(e) => setQuestion(qIndex, { prompt: e.target.value })} placeholder="Write the question" />
                  <p className="text-[11px] font-semibold text-slate-500">Answer choices — tick the correct one</p>
                  <div className="space-y-2">
                    {question.choices.map((choice, cIndex) => (
                      <div key={cIndex} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${question.correctIndex === cIndex ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                        <button type="button" onClick={() => setQuestion(qIndex, { correctIndex: cIndex })} title="Mark as correct" className={question.correctIndex === cIndex ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'}><CheckCircle2 className="h-5 w-5" /></button>
                        <input className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none" value={choice} onChange={(e) => setQuestion(qIndex, { choices: question.choices.map((c, i) => (i === cIndex ? e.target.value : c)) })} placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`} />
                        {question.choices.length > 2 && <button type="button" onClick={() => setQuestion(qIndex, { choices: question.choices.filter((_, i) => i !== cIndex), correctIndex: question.correctIndex === cIndex ? 0 : question.correctIndex > cIndex ? question.correctIndex - 1 : question.correctIndex })} className="text-slate-400 hover:text-rose-600" title="Remove choice"><X className="h-4 w-4" /></button>}
                      </div>
                    ))}
                  </div>
                  {question.choices.length < 6 && <button type="button" onClick={() => setQuestion(qIndex, { choices: [...question.choices, ''] })} className="text-xs font-bold text-amber-700 hover:underline">+ Add choice</button>}
                  <input className={fieldClass} value={question.explanation} onChange={(e) => setQuestion(qIndex, { explanation: e.target.value })} placeholder="Explanation (shown only if answers are revealed)" />
                </div>
              ))}
              <button type="button" onClick={() => setDraft({ ...draft, questions: [...draft.questions, blankQuestion()] })} className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-600 hover:border-[#FACC15] hover:text-slate-900">+ Add question</button>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.shuffle} onChange={(e) => setDraft({ ...draft, shuffle: e.target.checked })} />Shuffle question order for each student</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.showAnswers} onChange={(e) => setDraft({ ...draft, showAnswers: e.target.checked })} />Show correct answers after submitting</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Published — enrolled students can see it</label>
            </div>
            {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" disabled={saving} onClick={async () => { if (await post(draft as unknown as Record<string, unknown>)) { toast.success('Exam saved'); setDraft(null); } }} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save exam'}</button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── Results ── */}
      {results && (() => {
        const rows = attempts.filter((attempt) => attempt.examId === results.id).sort((a, b) => b.percent - a.percent);
        const stats = statsFor(results.id);
        return (
          <AdminModal wide title={`Results: ${results.title}`} onClose={() => setResults(null)}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-3"><p className="font-display text-xl font-extrabold">{stats.count}</p><p className="text-[11px] font-semibold text-slate-500">submitted</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="font-display text-xl font-extrabold">{stats.average ?? '—'}{stats.average !== null ? '%' : ''}</p><p className="text-[11px] font-semibold text-slate-500">average</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="font-display text-xl font-extrabold">{stats.passRate ?? '—'}{stats.passRate !== null ? '%' : ''}</p><p className="text-[11px] font-semibold text-slate-500">pass rate</p></div>
              </div>
              {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">No one has taken this exam yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="border-b border-slate-100 text-xs uppercase text-slate-400"><th className="py-2">Student</th><th>Score</th><th>Result</th><th>Time taken</th><th>Submitted</th></tr></thead>
                      <tbody>
                        {rows.map((attempt) => {
                          const minutes = attempt.submittedAt ? Math.max(1, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)) : null;
                          return (
                            <tr key={attempt.id} className="border-b border-slate-50">
                              <td className="py-2.5"><p className="font-semibold">{attempt.studentName}</p><p className="text-xs text-slate-500">{attempt.studentEmail}</p></td>
                              <td>{attempt.status === 'submitted' ? `${attempt.score}/${attempt.total} (${attempt.percent}%)` : '—'}</td>
                              <td>{attempt.status === 'in-progress' ? <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-800">Taking now</span> : attempt.passed ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Passed</span> : <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">Failed</span>}</td>
                              <td className="text-slate-600">{minutes ? `${minutes} min` : '—'}</td>
                              <td className="text-slate-600">{when(attempt.submittedAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" onClick={() => exportCsv(results)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Download className="h-4 w-4" />Download CSV</button>
                </>
              )}
            </div>
          </AdminModal>
        );
      })()}
    </section>
  );
}
