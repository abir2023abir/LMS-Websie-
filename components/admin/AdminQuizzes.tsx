'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';

type Question = { id?: string; prompt: string; choices: string[]; correctIndex: number; explanation: string };
type Quiz = {
  id?: string;
  courseId: string; courseTitle: string;
  moduleId: string; moduleTitle: string;
  lessonId: string; lessonTitle: string;
  title: string; passMark: number; maxAttempts: number; published: boolean;
  questions: Question[];
};
type Stats = Record<string, { attempts: number; average: number | null; passed: number }>;
type Outline = { id: string; title: string; modules: { id: string; title: string; lessons: { id: string; title: string }[] }[] }[];

const blankQuestion = (): Question => ({ prompt: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' });
const blankQuiz = (): Quiz => ({ courseId: '', courseTitle: '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '', title: '', passMark: 70, maxAttempts: 0, published: true, questions: [blankQuestion()] });
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [outline, setOutline] = useState<Outline>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all');
  const [draft, setDraft] = useState<Quiz | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/quizzes', { cache: 'no-store' }).then((res) => res.json()),
      fetch('/api/course-outline', { cache: 'no-store' }).then((res) => res.json()),
    ]).then(([quizData, outlineData]) => {
      setQuizzes(quizData.quizzes || []);
      setStats(quizData.stats || {});
      setOutline(outlineData.courses || []);
    }).catch(() => toast.error('Could not load quizzes')).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => quizzes.filter((quiz) => courseFilter === 'all' || quiz.courseId === courseFilter), [quizzes, courseFilter]);
  const grouped = useMemo(() => {
    const map = new Map<string, Quiz[]>();
    visible.forEach((quiz) => map.set(quiz.courseTitle || quiz.courseId, [...(map.get(quiz.courseTitle || quiz.courseId) || []), quiz]));
    return [...map.entries()];
  }, [visible]);

  const course = outline.find((item) => item.id === draft?.courseId);
  const mod = course?.modules.find((item) => item.id === draft?.moduleId);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      setQuizzes(data.quizzes || []);
      setStats(data.stats || {});
      return true;
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setNote('');
    if (await post(draft as unknown as Record<string, unknown>)) {
      toast.success('Quiz saved');
      setDraft(null);
    }
  };

  const setQuestion = (index: number, patch: Partial<Question>) => draft && setDraft({ ...draft, questions: draft.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)) });
  const pickCourse = (id: string) => {
    const picked = outline.find((item) => item.id === id);
    draft && setDraft({ ...draft, courseId: id, courseTitle: picked?.title || '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '' });
  };
  const pickModule = (id: string) => {
    const picked = course?.modules.find((item) => item.id === id);
    draft && setDraft({ ...draft, moduleId: id, moduleTitle: picked?.title || '', lessonId: '', lessonTitle: '' });
  };
  const pickLesson = (id: string) => {
    const picked = mod?.lessons.find((item) => item.id === id);
    draft && setDraft({ ...draft, lessonId: id, lessonTitle: picked?.title || '', title: draft.title || (picked ? `${picked.title} — Quiz` : '') });
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Lesson quizzes</h2>
          <p className="text-sm text-slate-500">Each quiz sits inside a course → module → lesson. Students take it from that lesson and see their score straight away.</p>
        </div>
        <button type="button" onClick={() => { setNote(''); setDraft(blankQuiz()); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />New quiz</button>
      </div>

      {outline.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button type="button" onClick={() => setCourseFilter('all')} className={`shrink-0 rounded-full px-3 py-1.5 ${courseFilter === 'all' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>All courses ({quizzes.length})</button>
          {outline.map((item) => {
            const count = quizzes.filter((quiz) => quiz.courseId === item.id).length;
            return <button key={item.id} type="button" onClick={() => setCourseFilter(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 ${courseFilter === item.id ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600'}`}>{item.title} ({count})</button>;
          })}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading quizzes…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-semibold text-slate-700">No quizzes yet</p>
          <p className="text-sm text-slate-500">Press “New quiz”, choose a course, module and lesson, then add your questions.</p>
        </div>
      ) : grouped.map(([courseTitle, items]) => (
        <div key={courseTitle} className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><BookOpen className="h-4 w-4 text-amber-600" />{courseTitle}</h3>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {items.map((quiz) => {
              const stat = quiz.id ? stats[quiz.id] : undefined;
              return (
                <div key={quiz.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500">{quiz.moduleTitle}<ChevronRight className="h-3 w-3 shrink-0" />{quiz.lessonTitle}</p>
                    <p className="truncate font-bold text-slate-900">{quiz.title}</p>
                    <p className="text-xs text-slate-500">
                      {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} · pass {quiz.passMark}%
                      {stat?.attempts ? ` · ${stat.attempts} attempt${stat.attempts === 1 ? '' : 's'}, average ${stat.average}%` : ' · no attempts yet'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${quiz.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{quiz.published ? 'Published' : 'Draft'}</span>
                  <button type="button" onClick={() => { setNote(''); setDraft({ ...quiz, questions: quiz.questions.map((q) => ({ ...q, choices: [...q.choices] })) }); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={async () => { if (confirm('Delete this quiz?') && await post({ action: 'delete', id: quiz.id })) toast.success('Quiz deleted'); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {draft && (
        <AdminModal wide title={draft.id ? 'Edit quiz' : 'New quiz'} onClose={() => setDraft(null)}>
          <div className="space-y-5">
            {/* Where the quiz lives */}
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Where students see it</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label><span className={labelClass}>1. Course</span>
                  <select className={fieldClass} value={draft.courseId} onChange={(e) => pickCourse(e.target.value)}>
                    <option value="">Choose course</option>
                    {outline.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>2. Module</span>
                  <select className={fieldClass} value={draft.moduleId} disabled={!course} onChange={(e) => pickModule(e.target.value)}>
                    <option value="">Choose module</option>
                    {course?.modules.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </label>
                <label><span className={labelClass}>3. Lesson</span>
                  <select className={fieldClass} value={draft.lessonId} disabled={!mod} onChange={(e) => pickLesson(e.target.value)}>
                    <option value="">Choose lesson</option>
                    {mod?.lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_120px_150px]">
              <label><span className={labelClass}>Quiz title</span><input className={fieldClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Ledgers — Quick Check" /></label>
              <label><span className={labelClass}>Pass mark %</span><input type="number" min={0} max={100} className={fieldClass} value={draft.passMark} onChange={(e) => setDraft({ ...draft, passMark: Number(e.target.value) })} /></label>
              <label><span className={labelClass}>Attempts (0 = no limit)</span><input type="number" min={0} max={50} className={fieldClass} value={draft.maxAttempts ?? 0} onChange={(e) => setDraft({ ...draft, maxAttempts: Number(e.target.value) })} /></label>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {draft.questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-800">Question {qIndex + 1}</span>
                    {draft.questions.length > 1 && (
                      <button type="button" onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== qIndex) })} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Remove question"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                  <textarea className={fieldClass} rows={2} value={question.prompt} onChange={(e) => setQuestion(qIndex, { prompt: e.target.value })} placeholder="Write the question" />
                  <p className="text-[11px] font-semibold text-slate-500">Answer choices — tick the correct one</p>
                  <div className="space-y-2">
                    {question.choices.map((choice, cIndex) => (
                      <div key={cIndex} className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${question.correctIndex === cIndex ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                        <button type="button" onClick={() => setQuestion(qIndex, { correctIndex: cIndex })} title="Mark as correct" className={question.correctIndex === cIndex ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'}>
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <input className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none" value={choice} onChange={(e) => setQuestion(qIndex, { choices: question.choices.map((c, i) => (i === cIndex ? e.target.value : c)) })} placeholder={`Choice ${String.fromCharCode(65 + cIndex)}`} />
                        {question.choices.length > 2 && (
                          <button type="button" onClick={() => setQuestion(qIndex, { choices: question.choices.filter((_, i) => i !== cIndex), correctIndex: question.correctIndex === cIndex ? 0 : question.correctIndex > cIndex ? question.correctIndex - 1 : question.correctIndex })} className="text-slate-400 hover:text-rose-600" title="Remove choice"><X className="h-4 w-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {question.choices.length < 6 && <button type="button" onClick={() => setQuestion(qIndex, { choices: [...question.choices, ''] })} className="text-xs font-bold text-amber-700 hover:underline">+ Add choice</button>}
                  <input className={fieldClass} value={question.explanation} onChange={(e) => setQuestion(qIndex, { explanation: e.target.value })} placeholder="Explanation shown after submitting (optional)" />
                </div>
              ))}
              <button type="button" onClick={() => setDraft({ ...draft, questions: [...draft.questions, blankQuestion()] })} className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-bold text-slate-600 hover:border-[#FACC15] hover:text-slate-900">+ Add question</button>
            </div>

            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Published — students can see and take this quiz</label>
            {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save quiz'}</button>
            </div>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
