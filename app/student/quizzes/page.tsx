'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, ChevronRight, HelpCircle } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';

type Quiz = {
  id: string; title: string; passMark: number; questions: unknown[];
  courseId: string; courseTitle: string; moduleTitle: string; lessonTitle: string;
  best: number | null; passed: boolean; attempts: number;
};

// All quizzes from the student's enrolled courses. Quizzes are taken inside each lesson.
export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setQuizzes(data.quizzes || []))
      .finally(() => setLoading(false));
  }, []);

  const byCourse = useMemo(() => {
    const map = new Map<string, Quiz[]>();
    quizzes.forEach((quiz) => map.set(quiz.courseId, [...(map.get(quiz.courseId) || []), quiz]));
    return [...map.values()];
  }, [quizzes]);
  const passed = quizzes.filter((quiz) => quiz.passed).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <FloatingNavbar />
        <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-28">
          <Link href="/student" className="text-xs font-bold text-slate-500 hover:text-slate-900">← Back to dashboard</Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold">My quizzes</h1>
              <p className="text-sm text-slate-500">Quizzes from your courses. Open a lesson to take its quiz.</p>
            </div>
            {quizzes.length > 0 && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{passed} of {quizzes.length} passed</span>}
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading quizzes…</p>
          ) : quizzes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-semibold text-slate-700">No quizzes yet</p>
              <p className="text-sm text-slate-500">Quizzes appear here once you are enrolled in a course that has them.</p>
            </div>
          ) : byCourse.map((items) => (
            <section key={items[0].courseId} className="space-y-2">
              <h2 className="font-bold text-slate-800">{items[0].courseTitle}</h2>
              <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
                {items.map((quiz) => (
                  <Link key={quiz.id} href={`/student/learn/${encodeURIComponent(quiz.courseId)}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500">{quiz.moduleTitle}<ChevronRight className="h-3 w-3 shrink-0" />{quiz.lessonTitle}</p>
                      <p className="truncate font-bold text-[#111827]">{quiz.title}</p>
                      <p className="text-xs text-slate-500">{quiz.questions.length} questions · pass mark {quiz.passMark}%</p>
                    </div>
                    {quiz.best === null ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Not taken</span>
                    ) : (
                      <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${quiz.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                        <Award className="h-3.5 w-3.5" />{quiz.best}%
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </AuthGuard>
  );
}
