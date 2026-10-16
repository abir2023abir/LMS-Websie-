'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';

type Question = { id: string; prompt: string; choices: string[] };
type Quiz = { id: string; title: string; questions: Question[] };

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<string>('');

  useEffect(() => {
    fetch('/api/quizzes').then((res) => res.json()).then((data) => setQuizzes(data.quizzes || []));
  }, []);

  return (
    <AuthGuard>
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <Link href="/student" className="text-xs font-bold text-slate-500">Back to dashboard</Link>
        <h1 className="font-display font-extrabold text-3xl">Quizzes</h1>
        {quizzes.length === 0 ? <p className="text-sm text-slate-500">No quizzes have been published yet.</p> : quizzes.map((quiz) => (
          <section key={quiz.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
            <h2 className="font-bold text-lg">{quiz.title}</h2>
            {quiz.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <p className="text-sm font-semibold">{question.prompt}</p>
                {question.choices.map((choice, index) => (
                  <label key={choice} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={question.id} checked={answers[question.id] === index} onChange={() => setAnswers({ ...answers, [question.id]: index })} />
                    {choice}
                  </label>
                ))}
              </div>
            ))}
            <button type="button" className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full" onClick={async () => {
              const res = await fetch('/api/quizzes/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: quiz.id, answers }) });
              const data = await res.json();
              setScore(res.ok ? `${quiz.title}: ${data.correct} / ${data.total}` : data.message);
            }}>Check answers</button>
          </section>
        ))}
        {score && <p className="font-bold">{score}</p>}
      </main>
    </AuthGuard>
  );
}
