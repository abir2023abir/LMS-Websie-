'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Lock } from 'lucide-react';

type ExamRow = {
  id: string;
  title: string;
  courseId: string;
  lessonTitle?: string;
  moduleTitle?: string;
  durationMinutes: number;
  passMark: number;
  questionCount: number;
  maxAttempts: number;
  attemptsUsed: number;
  locked: boolean;
  restricted: boolean;
  window: string;
  isFinal: boolean;
  best: { percent: number; passed: boolean } | null;
};

/** Classroom → Exams tab: this course's exams, with the student's attempts and best result. */
export default function LessonExams({ courseId }: { courseId: string }) {
  const [exams, setExams] = useState<ExamRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/exams', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => { if (active) setExams((Array.isArray(data.exams) ? data.exams : []).filter((exam: ExamRow) => String(exam.courseId) === String(courseId))); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [courseId]);

  if (failed) return <p className="text-sm text-rose-700">Could not load the exams. Refresh the page to try again.</p>;
  if (!exams) return <p className="text-sm text-slate-500">Loading exams…</p>;
  if (exams.length === 0) return <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">This course has no exam yet.</p>;

  return (
    <ul className="space-y-3">
      {exams.map((exam) => {
        const blocked = exam.locked || exam.restricted || exam.window !== 'open';
        const attemptsLeft = exam.maxAttempts ? Math.max(0, exam.maxAttempts - exam.attemptsUsed) : null;
        return (
          <li key={exam.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-display text-sm font-extrabold text-[#111827]">
                <GraduationCap className="h-4 w-4 shrink-0 text-[#A16207]" />{exam.title}
                {exam.isFinal && <span className="rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-bold text-[#FACC15]">Final</span>}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {[exam.lessonTitle || exam.moduleTitle, `${exam.questionCount} questions`, `${exam.durationMinutes} min`, `Pass ${exam.passMark}%`].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {exam.best ? `Best: ${exam.best.percent}% ${exam.best.passed ? '(passed)' : '(not passed)'}` : 'Not taken yet'}
                {attemptsLeft !== null && ` · ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left`}
              </p>
            </div>
            {blocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                <Lock className="h-3.5 w-3.5" />{exam.restricted ? 'Paused by your instructor' : exam.window === 'upcoming' ? 'Not open yet' : exam.window === 'closed' ? 'Closed' : 'Finish the earlier steps first'}
              </span>
            ) : (
              <Link href="/exams" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#EAB308]">Open exam</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
