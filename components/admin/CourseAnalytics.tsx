'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownUp, CheckCircle2, ClipboardCheck, GraduationCap, HelpCircle, Medal, Search, TrendingUp, Trophy, UserCheck, Users, Video,
} from 'lucide-react';
import { useCourseOutline } from './CoursePlacePicker';

type Row = {
  studentId: string; name: string; email: string; percent: number; lessonsDone: number; lessonsTotal: number;
  currentLesson: string; currentStep: string; quizAverage: number | null; examAverage: number | null;
  assignmentsSubmitted: number; lastActive: string; atRisk: boolean;
  timelineStatus: 'none' | 'on-track' | 'at-risk' | 'expired' | 'completed'; dueAt: string; endingAt: string;
  lessons?: { module: string; title: string; state: 'done' | 'current' | 'locked' }[];
};
type Data = {
  summary: {
    students: number; averageProgress: number; finished: number; activeThisWeek: number; atRisk: number;
    quizPassRate: number | null; examPassRate: number | null; toReview: number; pendingRequests: number; attendanceRate: number | null;
  };
  funnel: { lesson: string; module: string; completed: number; current: number }[];
  buckets: { range: string; students: number }[];
  rows: Row[];
};
type SortKey = 'rank' | 'progress' | 'quiz' | 'exam' | 'active';

const medal = ['text-[#EAB308]', 'text-slate-400', 'text-amber-700'];
const pct = (value: number | null) => (value === null ? '—' : `${value}%`);
const ago = (iso: string) => {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
};

/**
 * Course analytics for admins and instructors: headline numbers, where students drop off,
 * how progress is spread, and a sortable ranking with at-risk flags.
 */
export default function CourseAnalytics() {
  const outline = useCourseOutline();
  const [courseId, setCourseId] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);
  const [sort, setSort] = useState<SortKey>('rank');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [openId, setOpenId] = useState('');
  const [updatedAt, setUpdatedAt] = useState(0);
  const stamp = useRef('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { if (!courseId && outline[0]) setCourseId(outline[0].id); }, [outline, courseId]);
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    stamp.current = '';
    const load = (first: boolean) => {
      if (!first && document.hidden) return;
      if (first) setLoading(true);
      setError('');
      fetch(`/api/admin/progress?courseId=${encodeURIComponent(courseId)}&t=${Date.now()}`, { cache: 'no-store' })
        .then(async (res) => { const body = await res.json(); if (!res.ok) throw new Error(body.message || 'Could not load analytics.'); return body; })
        .then((body) => {
          if (!alive) return;
          const mark = JSON.stringify(body.summary) + (body.rows || []).map((row: Row) => `${row.studentId}:${row.percent}:${row.lessonsDone}:${row.lastActive}`).join('|');
          if (mark === stamp.current) { setUpdatedAt(Date.now()); return; }
          stamp.current = mark;
          setData(body);
          setUpdatedAt(Date.now());
        })
        .catch((err) => { if (alive) setError(err instanceof Error ? err.message : 'Could not load analytics.'); })
        .finally(() => { if (alive && first) setLoading(false); });
    };
    load(true);
    const timer = setInterval(() => load(false), 5000);
    const onVisible = () => { if (!document.hidden) load(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive = false; clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [courseId]);

  const rows = useMemo(() => {
    if (!data) return [];
    const ranked = data.rows.map((row, index) => ({ ...row, rank: index + 1 }));
    const q = query.trim().toLowerCase();
    const inDates = (iso: string) => {
      if (!from && !to) return true;
      if (!iso) return false;
      const day = iso.slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    };
    const filtered = ranked.filter((row) => (!onlyAtRisk || row.atRisk) && inDates(row.lastActive) && (!q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)));
    const by: Record<SortKey, (a: typeof ranked[number], b: typeof ranked[number]) => number> = {
      rank: (a, b) => a.rank - b.rank,
      progress: (a, b) => b.percent - a.percent,
      quiz: (a, b) => (b.quizAverage ?? -1) - (a.quizAverage ?? -1),
      exam: (a, b) => (b.examAverage ?? -1) - (a.examAverage ?? -1),
      active: (a, b) => String(b.lastActive).localeCompare(String(a.lastActive)),
    };
    return [...filtered].sort(by[sort]);
  }, [data, query, onlyAtRisk, sort, from, to]);

  const s = data?.summary;
  const kpis = s ? [
    { label: 'Students', value: s.students, icon: Users, tone: 'bg-slate-900 text-white' },
    { label: 'Average progress', value: `${s.averageProgress}%`, icon: TrendingUp, tone: 'bg-[#FEF9C3] text-[#A16207]' },
    { label: 'Finished course', value: s.finished, icon: Trophy, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Active this week', value: s.activeThisWeek, icon: Activity, tone: 'bg-sky-50 text-sky-700' },
    { label: 'At risk (7+ days idle)', value: s.atRisk, icon: AlertTriangle, tone: s.atRisk ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500' },
    { label: 'Quiz pass rate', value: pct(s.quizPassRate), icon: HelpCircle, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Exam pass rate', value: pct(s.examPassRate), icon: GraduationCap, tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Live attendance', value: pct(s.attendanceRate), icon: Video, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Assignments to review', value: s.toReview, icon: ClipboardCheck, tone: s.toReview ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500' },
    { label: 'Waiting for approval', value: s.pendingRequests, icon: UserCheck, tone: s.pendingRequests ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500' },
  ] : [];

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold">Course analytics</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live{updatedAt ? ` · ${Math.max(0, Math.round((now - updatedAt) / 1000))}s ago` : ''}
            </span>
            Ranking, charts, and lesson breakdown refresh every few seconds. Open a student for the module list.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-slate-500">From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="text-xs font-bold text-slate-500">To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" />
          </label>
          <select aria-label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
          {outline.length === 0 && <option value="">No courses</option>}
          {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

      {loading && !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
      ) : data && (
        <div className={`space-y-5 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {kpis.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0"><p className="font-display text-xl font-extrabold leading-tight">{value}</p><p className="truncate text-[11px] font-semibold text-slate-500">{label}</p></div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-100 p-4 lg:col-span-3">
              <p className="font-bold">Lesson funnel</p>
              <p className="mb-3 text-xs text-slate-500">Finished each lesson (green) and working on it now (yellow). A big drop shows a lesson that holds students back.</p>
              {data.funnel.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No lessons yet.</p> : (
                <div style={{ height: Math.max(220, data.funnel.length * 34) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="lesson" width={170} tick={{ fontSize: 11 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="completed" name="Finished" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="current" name="On it now" stackId="a" fill="#FACC15" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 lg:col-span-2">
              <p className="font-bold">Progress spread</p>
              <p className="mb-3 text-xs text-slate-500">How many students are at each stage of the course.</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.buckets} margin={{ left: -16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]}>
                      {data.buckets.map((bucket, index) => <Cell key={bucket.range} fill={index === data.buckets.length - 1 ? '#10b981' : '#111827'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-100 bg-[#0c1222] p-4 text-white lg:col-span-2">
              <p className="font-bold">Leaderboard</p>
              <p className="mb-3 text-xs text-slate-400">Top of this course by the same ranking score.</p>
              <div className="space-y-2">
                {[...rows].sort((a, b) => a.rank - b.rank).slice(0, 3).map((row) => (
                  <div key={row.studentId} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                    <span className="font-display text-lg font-black text-[#FACC15]">#{row.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{row.name}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#FACC15]" style={{ width: `${row.percent}%` }} /></div>
                    </div>
                    <span className="text-sm font-bold">{row.percent}%</span>
                  </div>
                ))}
                {rows.length === 0 && <p className="text-sm text-slate-400">No students in this view.</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 lg:col-span-3">
              <p className="font-bold">Progress comparison</p>
              <p className="mb-3 text-xs text-slate-500">Each bar is a student. The line is the course average.</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...rows].sort((a, b) => a.rank - b.rank).slice(0, 8).map((row) => ({ name: row.name.split(' ')[0], progress: row.percent, average: s?.averageProgress || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="progress" name="Progress" fill="#111827" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="average" name="Course average" fill="#FACC15" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Ranking table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-auto font-bold">Student ranking</p>
              <label className="flex min-w-[200px] items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student…" className="w-full bg-transparent text-sm focus:outline-none" />
              </label>
              <label className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold"><input type="checkbox" checked={onlyAtRisk} onChange={(e) => setOnlyAtRisk(e.target.checked)} />At risk only</label>
              <label className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold">
                <ArrowDownUp className="h-3.5 w-3.5" />
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent focus:outline-none">
                  <option value="rank">Rank</option><option value="progress">Progress</option><option value="quiz">Quiz average</option><option value="exam">Exam average</option><option value="active">Last active</option>
                </select>
              </label>
            </div>
            {rows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">{data.rows.length ? 'No students match.' : 'No students are enrolled in this course yet.'}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="w-14 py-2">Rank</th><th>Student</th><th className="w-56">Progress</th><th>Now on</th><th>Timeline</th><th>Quiz</th><th>Exam</th><th>Last active</th></tr></thead>
                  <tbody>
                    {rows.map((row) => (
                      <Fragment key={row.studentId}>
                      <tr className="cursor-pointer border-b border-slate-50 hover:bg-slate-50" onClick={() => setOpenId(openId === row.studentId ? '' : row.studentId)}>
                        <td className="py-3 font-display font-extrabold">{row.rank <= 3 ? <Medal className={`h-5 w-5 ${medal[row.rank - 1]}`} /> : `#${row.rank}`}</td>
                        <td>
                          <p className="flex items-center gap-1.5 font-semibold">{row.name}{row.atRisk && <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">At risk</span>}</p>
                          <p className="text-xs text-slate-500">{row.email}</p>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.percent === 100 ? 'bg-emerald-500' : 'bg-[#FACC15]'}`} style={{ width: `${row.percent}%` }} /></div>
                            <span className="w-20 text-right text-xs font-semibold text-slate-600">{row.lessonsDone}/{row.lessonsTotal} · {row.percent}%</span>
                          </div>
                        </td>
                        <td className="max-w-[220px]">
                          {row.percent === 100 ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Finished</span> : (
                            <><p className="truncate text-xs font-semibold text-slate-700">{row.currentLesson}</p><p className="truncate text-[11px] text-slate-500">{row.currentStep}</p></>
                          )}
                        </td>
                        <td className="text-xs">
                          {row.timelineStatus === 'none' ? <span className="text-slate-400">No dates set</span> : (
                            <>
                              <span className={`rounded-full px-2 py-0.5 font-bold ${row.timelineStatus === 'expired' ? 'bg-rose-100 text-rose-800' : row.timelineStatus === 'at-risk' ? 'bg-amber-100 text-amber-800' : row.timelineStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                {row.timelineStatus === 'expired' ? 'Expired' : row.timelineStatus === 'at-risk' ? 'At risk' : row.timelineStatus === 'completed' ? 'Completed' : 'On track'}
                              </span>
                              {row.dueAt && row.timelineStatus !== 'completed' && <p className="mt-1 text-[11px] text-slate-500">Lesson due {new Date(row.dueAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })}</p>}
                            </>
                          )}
                        </td>
                        <td className="text-sm">{pct(row.quizAverage)}</td>
                        <td className="text-sm">{pct(row.examAverage)}</td>
                        <td className={`text-xs ${row.atRisk ? 'font-semibold text-rose-700' : 'text-slate-500'}`}>{ago(row.lastActive)}</td>
                      </tr>
                      {openId === row.studentId && (
                        <tr key={`${row.studentId}-detail`} className="border-b border-slate-100 bg-slate-50">
                          <td colSpan={8} className="px-3 py-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Lessons</p>
                            {(row.lessons || []).length === 0 ? <p className="text-sm text-slate-500">No lesson breakdown for this student.</p> : (
                              <div className="grid gap-3 md:grid-cols-2">
                                {Object.entries((row.lessons || []).reduce<Record<string, { title: string; state: string }[]>>((groups, lesson) => {
                                  (groups[lesson.module] ||= []).push(lesson);
                                  return groups;
                                }, {})).map(([module, lessons]) => (
                                  <div key={module} className="rounded-2xl bg-white p-3">
                                    <p className="text-sm font-bold">{module}</p>
                                    <ul className="mt-2 space-y-1.5">
                                      {lessons.map((lesson) => (
                                        <li key={lesson.title} className="flex items-center gap-2 text-xs">
                                          <span className={`h-1.5 w-16 overflow-hidden rounded-full bg-slate-100`}><span className={`block h-full ${lesson.state === 'done' ? 'w-full bg-emerald-500' : lesson.state === 'current' ? 'w-1/2 bg-[#FACC15]' : 'w-0'}`} /></span>
                                          <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                                          <span className="font-semibold text-slate-500">{lesson.state}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
