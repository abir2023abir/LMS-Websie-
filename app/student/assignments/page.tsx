'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronRight, ClipboardList } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';

type Assignment = {
  id: string; title: string; courseId: string; courseTitle: string; moduleTitle: string; lessonTitle: string; dueDate: string; maxScore: number;
  submission: { status: 'submitted' | 'needs-changes' | 'graded'; score: number | null } | null;
};

const day = (value: string) => (value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' }) : '');

// All assignments from the student's courses. They are submitted inside each lesson.
export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assignments', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setAssignments(data.assignments || []))
      .finally(() => setLoading(false));
  }, []);

  const byCourse = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    assignments.forEach((item) => map.set(item.courseId, [...(map.get(item.courseId) || []), item]));
    return [...map.values()];
  }, [assignments]);
  const todo = assignments.filter((item) => !item.submission || item.submission.status === 'needs-changes').length;

  const badge = (item: Assignment) => {
    if (!item.submission) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">To do</span>;
    if (item.submission.status === 'graded') return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{item.submission.score}/{item.maxScore}</span>;
    if (item.submission.status === 'needs-changes') return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">Changes requested</span>;
    return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Submitted</span>;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <FloatingNavbar />
        <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-28">
          <Link href="/student" className="text-xs font-bold text-slate-500 hover:text-slate-900">← Back to dashboard</Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold">My assignments</h1>
              <p className="text-sm text-slate-500">Open a lesson to read the task and submit your work.</p>
            </div>
            {assignments.length > 0 && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{todo} to do</span>}
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading assignments…</p>
          ) : assignments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 font-semibold text-slate-700">No assignments yet</p>
              <p className="text-sm text-slate-500">Assignments appear here once your courses have them.</p>
            </div>
          ) : byCourse.map((items) => (
            <section key={items[0].courseId} className="space-y-2">
              <h2 className="font-bold text-slate-800">{items[0].courseTitle}</h2>
              <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white">
                {items.map((item) => (
                  <Link key={item.id} href={`/student/learn/${encodeURIComponent(item.courseId)}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500">{item.moduleTitle}<ChevronRight className="h-3 w-3 shrink-0" />{item.lessonTitle}</p>
                      <p className="truncate font-bold text-[#111827]">{item.title}</p>
                      {item.dueDate && <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3 w-3" />Due {day(item.dueDate)}</p>}
                    </div>
                    {badge(item)}
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
