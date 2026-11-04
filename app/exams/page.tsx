'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Award, CalendarClock, Check, Clock, GraduationCap, X } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

type ExamSummary = {
  id: string; title: string; description: string; courseTitle: string; moduleTitle: string; lessonTitle: string;
  durationMinutes: number; opensAt: string; closesAt: string; passMark: number; maxAttempts: number; questionCount: number;
  window: 'open' | 'upcoming' | 'closed'; locked: boolean; attemptsUsed: number; inProgress: boolean;
  best: { score: number; total: number; percent: number; passed: boolean } | null;
};
type Question = { id: string; prompt: string; choices: string[]; points: number };
type Running = { examId: string; title: string; attemptId: string; deadline: string; questions: Question[] };
type Review = { id: string; prompt: string; choices: string[]; correctIndex: number; chosen: number; explanation: string };
type Outcome = { score: number; total: number; percent: number; passed: boolean; passMark: number; review: Review[] | null };

const when = (iso: string) => (iso ? new Date(iso).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');
const clock = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h ? `${h}:` : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`;
};

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<Running | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [now, setNow] = useState(Date.now());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false);

  const load = () => fetch('/api/exams', { cache: 'no-store' }).then((res) => res.json()).then((data) => setExams(data.exams || [])).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);

  const call = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Something went wrong.');
    return data;
  };

  const start = async (exam: ExamSummary) => {
    if (!exam.inProgress && !confirm(`Start "${exam.title}"? The ${exam.durationMinutes}-minute timer starts now and keeps running even if you leave the page.`)) return;
    setBusy(true);
    setError('');
    try {
      const data = await call({ action: 'start', examId: exam.id });
      submitted.current = false;
      setOutcome(null);
      setAnswers(data.answers || {});
      setRunning({ examId: exam.id, title: data.title, attemptId: data.attemptId, deadline: data.deadline, questions: data.questions });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the exam.');
    } finally {
      setBusy(false);
    }
  };

  const submit = useCallback(async (auto = false) => {
    if (!running || submitted.current) return;
    if (!auto) {
      const unanswered = running.questions.filter((question) => !Number.isInteger(answers[question.id])).length;
      if (!confirm(unanswered ? `You have ${unanswered} unanswered question(s). Submit anyway?` : 'Submit your exam now?')) return;
    }
    submitted.current = true;
    setBusy(true);
    try {
      const data = await call({ action: 'submit', examId: running.examId, attemptId: running.attemptId, answers });
      setOutcome(data);
      setRunning(null);
      void load();
    } catch (err) {
      submitted.current = false;
      setError(err instanceof Error ? err.message : 'Could not submit. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }, [running, answers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown; submits automatically when time is up.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const remaining = running ? new Date(running.deadline).getTime() - now : 0;
  useEffect(() => { if (running && remaining <= 0) void submit(true); }, [running, remaining, submit]);

  // Save answers on the server as the student goes, so a refresh loses nothing.
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => { call({ action: 'save', examId: running.examId, attemptId: running.attemptId, answers }).catch(() => undefined); }, 800);
    return () => clearTimeout(timer);
  }, [answers, running]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving mid-exam.
  useEffect(() => {
    if (!running) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [running]);

  const answered = running ? running.questions.filter((question) => Number.isInteger(answers[question.id])).length : 0;

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-slate-50 text-[#111827]">
        <FloatingNavbar />
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 pb-16 pt-28">
          {error && <p className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"><AlertTriangle className="h-4 w-4" />{error}</p>}

          {running ? (
            <>
              {/* Sticky exam bar */}
              <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#111827] p-4 text-white shadow-lg">
                <div className="min-w-0">
                  <p className="truncate font-display font-bold">{running.title}</p>
                  <p className="text-xs text-slate-300">{answered} of {running.questions.length} answered · saved automatically</p>
                </div>
                <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-lg font-bold ${remaining < 60000 ? 'bg-rose-500' : remaining < 300000 ? 'bg-amber-500 text-[#111827]' : 'bg-white/10'}`}>
                  <Clock className="h-4 w-4" />{clock(remaining)}
                </span>
              </div>

              {running.questions.map((question, index) => (
                <div key={question.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{index + 1}. {question.prompt}</p>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{question.points} mark{question.points > 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid gap-2">
                    {question.choices.map((choice, cIndex) => (
                      <button key={cIndex} type="button" onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: cIndex }))} className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${answers[question.id] === cIndex ? 'border-[#FACC15] bg-[#FEF9C3] font-semibold' : 'border-slate-200 hover:border-slate-300'}`}>
                        <span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + cIndex)}.</span>{choice}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => submit(false)} disabled={busy} className="w-full rounded-2xl bg-[#FACC15] py-4 text-base font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-50">
                {busy ? 'Submitting…' : 'Submit exam'}
              </button>
            </>
          ) : outcome ? (
            <div className="space-y-5">
              <div className={`rounded-3xl p-8 text-center ${outcome.passed ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Award className={`mx-auto h-12 w-12 ${outcome.passed ? 'text-emerald-600' : 'text-amber-600'}`} />
                <p className="mt-3 font-display text-4xl font-extrabold">{outcome.percent}%</p>
                <p className="text-sm font-semibold text-slate-600">{outcome.score} of {outcome.total} marks · pass mark {outcome.passMark}%</p>
                <p className={`mt-2 text-lg font-bold ${outcome.passed ? 'text-emerald-700' : 'text-amber-800'}`}>{outcome.passed ? `Congratulations! You passed — the pass mark was ${outcome.passMark}% and you scored ${outcome.percent}%.` : `Not passed this time. You need ${outcome.passMark}% and you scored ${outcome.percent}%.`}</p>
              </div>
              {outcome.review && outcome.review.map((item, index) => (
                <div key={item.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold">{index + 1}. {item.prompt}</p>
                  {item.choices.map((choice, cIndex) => (
                    <div key={cIndex} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${cIndex === item.correctIndex ? 'border-emerald-300 bg-emerald-50' : cIndex === item.chosen ? 'border-rose-300 bg-rose-50' : 'border-slate-100'}`}>
                      <span>{choice}</span>
                      {cIndex === item.correctIndex ? <Check className="h-4 w-4 text-emerald-600" /> : cIndex === item.chosen ? <X className="h-4 w-4 text-rose-600" /> : null}
                    </div>
                  ))}
                  {item.explanation && <p className="text-xs text-slate-600"><strong>Why:</strong> {item.explanation}</p>}
                </div>
              ))}
              <button type="button" onClick={() => setOutcome(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold hover:bg-slate-50">Back to my exams</button>
            </div>
          ) : (
            <>
              <div>
                <Link href="/student" className="text-xs font-bold text-slate-500 hover:text-slate-900">← Back to dashboard</Link>
                <h1 className="mt-2 font-display text-3xl font-extrabold">My exams</h1>
                <p className="text-sm text-slate-500">Exams from your courses. Each exam is timed — make sure you have a steady connection before you start.</p>
              </div>
              {loading ? (
                <p className="py-10 text-center text-sm text-slate-500">Loading exams…</p>
              ) : exams.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 font-semibold text-slate-700">No exams yet</p>
                  <p className="text-sm text-slate-500">Exams appear here when your courses schedule them.</p>
                </div>
              ) : exams.map((exam) => {
                const attemptsLeft = exam.maxAttempts ? exam.maxAttempts - exam.attemptsUsed : Infinity;
                const canStart = !exam.locked && exam.window === 'open' && (exam.inProgress || attemptsLeft > 0);
                return (
                  <article key={exam.id} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500">{exam.courseTitle}{exam.moduleTitle ? ` · ${exam.moduleTitle}` : ''}{exam.lessonTitle ? ` · ${exam.lessonTitle}` : ''}</p>
                        <p className="font-display text-lg font-bold">{exam.title}</p>
                      </div>
                      {exam.best && <span className={`rounded-full px-3 py-1 text-xs font-bold ${exam.best.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>Best {exam.best.percent}%{exam.best.passed ? ' · Passed' : ''}</span>}
                    </div>
                    {exam.description && <p className="whitespace-pre-wrap text-sm text-slate-600">{exam.description}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{exam.durationMinutes} minutes</span>
                      <span>{exam.questionCount} questions</span>
                      <span>Pass mark {exam.passMark}%</span>
                      <span>{exam.maxAttempts ? `${Math.max(0, attemptsLeft)} of ${exam.maxAttempts} attempts left` : 'Unlimited attempts'}</span>
                      {exam.window === 'upcoming' && <span className="flex items-center gap-1 font-semibold text-sky-700"><CalendarClock className="h-3.5 w-3.5" />Opens {when(exam.opensAt)}</span>}
                      {exam.window === 'open' && exam.closesAt && <span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />Closes {when(exam.closesAt)}</span>}
                      {exam.window === 'closed' && <span className="font-semibold text-slate-500">Closed</span>}
                    </div>
                    <button type="button" disabled={!canStart || busy} onClick={() => start(exam)} className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500">
                      {exam.locked ? 'Finish the lesson, quiz and assignment first' : exam.inProgress ? 'Resume exam' : exam.window === 'upcoming' ? 'Not open yet' : exam.window === 'closed' ? 'Exam closed' : attemptsLeft <= 0 ? 'No attempts left' : exam.attemptsUsed ? 'Try again' : 'Start exam'}
                    </button>
                  </article>
                );
              })}
            </>
          )}
        </main>
        <EnglishFooter />
      </div>
    </AuthGuard>
  );
}
