'use client';

import { useEffect, useState } from 'react';
import { Medal, TrendingUp, Trophy, Users } from 'lucide-react';
import ProgressRequests from './ProgressRequests';
import { useCourseOutline } from './CoursePlacePicker';

type Row = {
  studentId: string; name: string; email: string; percent: number; lessonsDone: number; lessonsTotal: number;
  currentLesson: string; quizAverage: number | null; examAverage: number | null;
};

const medal = ['text-[#EAB308]', 'text-slate-400', 'text-amber-700'];

/** Admin → Progress: next-lesson requests plus a per-course ranking of every student. */
export default function AdminProgress() {
  const outline = useCourseOutline();
  const [courseId, setCourseId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!courseId && outline[0]) setCourseId(outline[0].id); }, [outline, courseId]);
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(`/api/admin/progress?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => res.json()).then((data) => setRows(data.ranking || [])).finally(() => setLoading(false));
  }, [courseId]);

  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0;
  const finished = rows.filter((row) => row.percent === 100).length;
  // Where students are: count per current lesson, to spot a lesson that holds people back.
  const stuck = Object.entries(rows.filter((row) => row.percent < 100).reduce<Record<string, number>>((acc, row) => {
    acc[row.currentLesson || '—'] = (acc[row.currentLesson || '—'] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="space-y-5">
      <ProgressRequests />

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold">Ranking & progress</h2>
            <p className="text-sm text-slate-500">Who is ahead in each course: lessons finished first, then exam and quiz scores.</p>
          </div>
          <select aria-label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
            {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Students', value: rows.length, icon: Users },
            { label: 'Average progress', value: `${average}%`, icon: TrendingUp },
            { label: 'Finished course', value: finished, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Icon className="h-5 w-5 text-amber-600" />
              <div><p className="font-display text-xl font-extrabold">{value}</p><p className="text-[11px] font-semibold text-slate-500">{label}</p></div>
            </div>
          ))}
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-[11px] font-bold uppercase text-amber-700">Most students are on</p>
            {stuck.length === 0 ? <p className="text-sm text-amber-900">—</p> : stuck.map(([lesson, count]) => <p key={lesson} className="truncate text-xs text-amber-900"><strong>{count}</strong> · {lesson}</p>)}
          </div>
        </div>

        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading ranking…</p> : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">No students are enrolled in this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="py-2 w-14">Rank</th><th>Student</th><th className="w-56">Progress</th><th>Now on</th><th>Quiz avg</th><th>Exam avg</th></tr></thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.studentId} className="border-b border-slate-50">
                    <td className="py-3 font-display font-extrabold">{index < 3 ? <Medal className={`h-5 w-5 ${medal[index]}`} /> : `#${index + 1}`}</td>
                    <td><p className="font-semibold">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.percent === 100 ? 'bg-emerald-500' : 'bg-[#FACC15]'}`} style={{ width: `${row.percent}%` }} /></div>
                        <span className="w-20 text-right text-xs font-semibold text-slate-600">{row.lessonsDone}/{row.lessonsTotal} · {row.percent}%</span>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate text-xs text-slate-600">{row.percent === 100 ? 'Finished' : row.currentLesson}</td>
                    <td>{row.quizAverage ?? '—'}{row.quizAverage !== null ? '%' : ''}</td>
                    <td>{row.examAverage ?? '—'}{row.examAverage !== null ? '%' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
