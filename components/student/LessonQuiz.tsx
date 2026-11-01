'use client';

import { useEffect, useState } from 'react';
import { Award, Check, HelpCircle, RotateCcw, X } from 'lucide-react';

type Question = { id: string; prompt: string; choices: string[] };
type Quiz = { id: string; title: string; passMark: number; questions: Question[]; best: number | null; passed: boolean; attempts: number };
type Result = { id: string; chosen: number; correctIndex: number; correct: boolean; explanation: string };
type Outcome = { correct: number; total: number; percent: number; passed: boolean; passMark: number; results: Result[] };

/** The quizzes attached to one lesson: answer, submit, and see the marked result. */
export default function LessonQuiz({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [submitting, setSubmitting] = useState('');

  const load = () => {
    fetch(`/api/quizzes?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.locked) { setMessage(data.message || 'Could not load quizzes.'); setQuizzes([]); return; }
        setMessage('');
        setQuizzes(data.quizzes || []);
      })
      .catch(() => setMessage('Could not load quizzes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); setOutcomes({}); setAnswers({}); load(); }, [courseId, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (quizId: string, questionId: string, index: number) => {
    if (outcomes[quizId]) return;
    setAnswers((prev) => ({ ...prev, [quizId]: { ...prev[quizId], [questionId]: index } }));
  };

  const submit = async (quiz: Quiz) => {
    setSubmitting(quiz.id);
    try {
      const res = await fetch('/api/quizzes/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: quiz.id, answers: answers[quiz.id] || {} }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not submit.');
      setOutcomes((prev) => ({ ...prev, [quiz.id]: data }));
      setQuizzes((prev) => prev.map((item) => (item.id === quiz.id ? { ...item, attempts: item.attempts + 1, best: Math.max(item.best ?? 0, data.percent), passed: item.passed || data.passed } : item)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit.');
    } finally {
      setSubmitting('');
    }
  };

  const retake = (quizId: string) => {
    setOutcomes((prev) => { const next = { ...prev }; delete next[quizId]; return next; });
    setAnswers((prev) => ({ ...prev, [quizId]: {} }));
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-500">Loading quiz…</p>;
  if (message && quizzes.length === 0) return <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">{message}</p>;
  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
        <HelpCircle className="mx-auto mb-2 h-6 w-6 text-slate-300" />
        There is no quiz for this lesson.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {quizzes.map((quiz) => {
        const outcome = outcomes[quiz.id];
        const picked = answers[quiz.id] || {};
        const answeredAll = quiz.questions.every((question) => Number.isInteger(picked[question.id]));
        return (
          <div key={quiz.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#111827] p-4 text-white">
              <div>
                <p className="font-display font-bold">{quiz.title}</p>
                <p className="text-xs text-slate-300">{quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} · pass mark {quiz.passMark}%</p>
              </div>
              {quiz.best !== null && (
                <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${quiz.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-200'}`}>
                  <Award className="h-3.5 w-3.5" />Best {quiz.best}%{quiz.passed ? ' · Passed' : ''}
                </span>
              )}
            </div>

            {outcome && (
              <div className={`rounded-2xl border p-4 text-sm font-semibold ${outcome.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                You scored {outcome.correct} / {outcome.total} ({outcome.percent}%). {outcome.passed ? 'Well done — you passed!' : `You need ${outcome.passMark}% to pass. Review the lesson and try again.`}
              </div>
            )}

            {quiz.questions.map((question, qIndex) => {
              const result = outcome?.results.find((item) => item.id === question.id);
              return (
                <div key={question.id} className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-[#111827]">{qIndex + 1}. {question.prompt}</p>
                  <div className="grid gap-2">
                    {question.choices.map((choice, cIndex) => {
                      const selected = picked[question.id] === cIndex;
                      let tone = selected ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-200 bg-white hover:border-slate-300';
                      if (result) {
                        if (cIndex === result.correctIndex) tone = 'border-emerald-300 bg-emerald-50';
                        else if (selected) tone = 'border-rose-300 bg-rose-50';
                        else tone = 'border-slate-200 bg-white opacity-70';
                      }
                      return (
                        <button key={cIndex} type="button" disabled={Boolean(outcome)} onClick={() => choose(quiz.id, question.id, cIndex)} className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${tone}`}>
                          <span><span className="mr-2 font-bold text-slate-400">{String.fromCharCode(65 + cIndex)}.</span>{choice}</span>
                          {result && cIndex === result.correctIndex && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                          {result && selected && !result.correct && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                        </button>
                      );
                    })}
                  </div>
                  {result?.explanation && <p className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><strong>Why:</strong> {result.explanation}</p>}
                </div>
              );
            })}

            {outcome ? (
              <button type="button" onClick={() => retake(quiz.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-[#111827] hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Try again</button>
            ) : (
              <button type="button" onClick={() => submit(quiz)} disabled={!answeredAll || submitting === quiz.id} className="rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-50">
                {submitting === quiz.id ? 'Checking…' : answeredAll ? 'Submit answers' : 'Answer every question to submit'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
