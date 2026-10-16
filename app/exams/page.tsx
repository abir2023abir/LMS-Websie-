'use client';

import { useEffect, useState } from 'react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import { useAuth } from '@/context/AuthContext';
import { addQuestion, allAssignments, appealAttempt, paper, progressRankings, questions, rankings, reviewAssignment, reviewAttempt, submitExam } from '@/lib/workspace';
import type { ExamQuestion } from '@/lib/workspace';

export default function ExamsPage() {
  const { user, role } = useAuth();
  const [bank, setBank] = useState<ExamQuestion[]>(paper(2));
  const [board, setBoard] = useState(rankings());
  const [ladder, setLadder] = useState(progressRankings());
  const [work, setWork] = useState(allAssignments());
  const [picks, setPicks] = useState<number[]>([]);
  const [written, setWritten] = useState('');
  const [appeal, setAppeal] = useState('');
  const [result, setResult] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [choices, setChoices] = useState('Yes, No');
  const [answer, setAnswer] = useState(0);
  const [count, setCount] = useState(2);
  const [review, setReview] = useState('');

  const refresh = () => {
    setBoard(rankings());
    setLadder(progressRankings());
    setWork(allAssignments());
  };
  useEffect(() => {
    setBank(questions());
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-16 w-full space-y-6">
        <h1 className="font-display font-extrabold text-3xl">Exams and ranking</h1>
        <WorkspaceLinks />

        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold">Question bank</h2>
            <input type="number" min={1} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-16 border border-slate-200 rounded-xl px-2 py-1 text-sm" />
            <button type="button" className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100" onClick={() => { setBank(paper(count)); setPicks([]); }}>Build paper</button>
          </div>
          {bank.map((question, index) => (
            <fieldset key={question.id} className="space-y-2">
              <legend className="font-semibold text-sm">{index + 1}. {question.prompt}</legend>
              {question.choices.map((choice, choiceIndex) => (
                <label key={choice} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={question.id}
                    checked={picks[index] === choiceIndex}
                    onChange={() => {
                      const next = [...picks];
                      next[index] = choiceIndex;
                      setPicks(next);
                    }}
                  />
                  {choice}
                </label>
              ))}
            </fieldset>
          ))}
          <label className="block text-xs font-bold text-slate-500">Written answer</label>
          <textarea value={written} onChange={(e) => setWritten(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-16" placeholder="Short written answer for the mentor" />
          <button
            type="button"
            className="bg-[#111827] text-white font-bold text-sm px-4 py-2 rounded-xl"
            onClick={() => {
              const scored = submitExam(user?.email || 'student@local', picks, bank, written);
              setResult(`${scored.score} / ${scored.total} · ${scored.passed ? 'pass' : 'fail'}`);
              setWritten('');
              refresh();
            }}
          >
            Submit and mark
          </button>
          {result && <p className="font-bold">Score: {result}</p>}
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h2 className="font-bold">Add a question</h2>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <input value={choices} onChange={(e) => setChoices(e.target.value)} placeholder="Choices, separated by commas" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <input type="number" value={answer} onChange={(e) => setAnswer(Number(e.target.value))} className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          <button
            type="button"
            className="bg-[#FACC15] font-bold text-sm px-4 py-2 rounded-xl"
            onClick={() => {
              if (!prompt.trim()) return;
              addQuestion(prompt, choices.split(',').map((item) => item.trim()).filter(Boolean), answer);
              setPrompt('');
              refresh();
            }}
          >
            Save to bank
          </button>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold mb-3">Rank by course progress</h2>
          <ol className="space-y-2 text-sm">
            {ladder.map((row, index) => (
              <li key={row.email}>{index + 1}. {row.name} — {row.progress}%</li>
            ))}
            {ladder.length === 0 && <li>No student progress yet.</li>}
          </ol>
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold mb-3">Exam results</h2>
          <ol className="space-y-2 text-sm">
            {board.map((row, index) => (
              <li key={row.id} className="space-y-1">
                <p>{index + 1}. {row.email} — {row.score}/{row.total} · {row.passed ? 'pass' : 'fail'}</p>
                {row.written && <p className="text-slate-600">Written: {row.written}</p>}
                {row.review && <p className="text-slate-600">Mentor: {row.review}</p>}
                {row.appeal && <p className="text-slate-600">Appeal: {row.appeal}</p>}
                {row.email === (user?.email || '') && (
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!appeal.trim()) return; appealAttempt(row.id, appeal); setAppeal(''); refresh(); }}>
                    <input value={appeal} onChange={(e) => setAppeal(e.target.value)} placeholder="Appeal this result" className="border border-slate-200 rounded-xl px-3 py-1 text-xs" />
                    <button className="text-xs font-bold underline">Send appeal</button>
                  </form>
                )}
                {role === 'Instructor' && (
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); reviewAttempt(row.id, review || 'Reviewed', true); setReview(''); refresh(); }}>
                    <input value={review} onChange={(e) => setReview(e.target.value)} placeholder="Mentor review" className="border border-slate-200 rounded-xl px-3 py-1 text-xs" />
                    <button className="text-xs font-bold underline">Mark pass</button>
                    <button type="button" className="text-xs font-bold underline" onClick={() => { reviewAttempt(row.id, review || 'Needs another attempt', false); setReview(''); refresh(); }}>Mark fail</button>
                  </form>
                )}
              </li>
            ))}
            {board.length === 0 && <li>No exam has been submitted yet.</li>}
          </ol>
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <h2 className="font-bold">Assignments waiting for a mentor</h2>
          {work.map((item) => (
            <form key={`${item.lessonId}-${item.email}-${item.text}`} className="text-sm flex flex-wrap gap-2 items-center" onSubmit={(e) => { e.preventDefault(); reviewAssignment(item.lessonId, item.email, review || 'Checked'); setReview(''); refresh(); }}>
              <span>{item.email} · {item.status} · {item.text}</span>
              {role === 'Instructor' && <button className="text-xs font-bold underline">Mark reviewed</button>}
            </form>
          ))}
          {work.length === 0 && <p className="text-sm text-slate-600">No assignments yet.</p>}
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
