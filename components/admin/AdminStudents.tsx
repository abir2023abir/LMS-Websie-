'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, ChevronRight, Copy, CreditCard, GraduationCap, KeyRound, Mail, MapPin, Pencil, Phone, Plus, Search, ShieldOff, Trash2, UserCheck, UserPlus, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import { useCourseOutline } from './CoursePlacePicker';
import { taka } from '@/lib/utils';

type Status = 'Active' | 'Paused' | 'Completed' | 'Dropped';
type Details = {
  studentCode: string; dateOfBirth: string; gender: '' | 'Male' | 'Female' | 'Other'; address: string; city: string;
  institution: string; educationLevel: string; occupation: string;
  guardianName: string; guardianRelation: string; guardianPhone: string; guardianEmail: string;
  status: Status; source: string; notes: string;
};
type Student = { id: string; name: string; email: string; phone: string; disabled: boolean; createdAt: string; details: Details; courseIds: string[]; paid: number };
type Enrollment = { courseId: string; payment: 'paid' | 'free'; method: string; amount: string; transactionId: string };
type Draft = { id?: string; name: string; email: string; phone: string; password: string; details: Details; enrollments: Enrollment[] };
type Record_ = {
  payments: { id: string; courseTitle: string; amount: number; method: string; status: string; transactionId: string; createdAt: string }[];
  quizAttempts: { id: string; quizId: string; percent: number; passed: boolean; at: string }[];
  examAttempts: { id: string; examId: string; score: number; total: number; percent: number; passed: boolean; submittedAt: string }[];
  submissions: { id: string; assignmentTitle: string; status: string; score: number | null; maxScore: number; submittedAt: string }[];
};

const emptyDetails = (): Details => ({
  studentCode: '', dateOfBirth: '', gender: '', address: '', city: '', institution: '', educationLevel: '', occupation: '',
  guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '', status: 'Active', source: '', notes: '',
});
const blankDraft = (): Draft => ({ name: '', email: '', phone: '', password: '', details: emptyDetails(), enrollments: [] });
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';
const statusTone: Record<Status, string> = { Active: 'bg-emerald-50 text-emerald-700', Paused: 'bg-amber-50 text-amber-800', Completed: 'bg-sky-50 text-sky-800', Dropped: 'bg-slate-100 text-slate-600' };
const SOURCES = ['Website', 'Facebook', 'Referral', 'Walk-in', 'Phone call', 'Other'];
const EDUCATION = ['SSC', 'HSC', 'Diploma', 'Bachelor’s', 'Master’s', 'Other'];
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div><p className="font-bold text-slate-900">{title}</p>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'sm:col-span-2' : ''}><span className={labelClass}>{label}</span>{children}</label>;
}

export default function AdminStudents() {
  const outline = useCourseOutline();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status | 'disabled'>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [record, setRecord] = useState<Record_ | null>(null);
  const [tab, setTab] = useState<'overview' | 'courses' | 'payments' | 'results'>('overview');
  const [enrollDraft, setEnrollDraft] = useState<Enrollment>({ courseId: '', payment: 'paid', method: 'Cash', amount: '', transactionId: '' });

  const courseTitle = (id: string) => outline.find((course) => course.id === id)?.title || id;

  useEffect(() => {
    fetch('/api/admin/students', { cache: 'no-store' }).then((res) => res.json())
      .then((data) => setStudents(data.students || [])).catch(() => toast.error('Could not load students')).finally(() => setLoading(false));
  }, []);

  const loadRecord = (id: string) => {
    setRecord(null);
    fetch(`/api/admin/students?id=${encodeURIComponent(id)}`, { cache: 'no-store' }).then((res) => res.json()).then((data) => setRecord(data)).catch(() => undefined);
  };

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setNote('');
    try {
      const res = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      setStudents(data.students || []);
      return data;
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Save failed.');
      toast.error(error instanceof Error ? error.message : 'Save failed.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const stats = {
    total: students.length,
    active: students.filter((s) => s.details.status === 'Active' && !s.disabled).length,
    newThisMonth: students.filter((s) => s.createdAt >= monthStart).length,
    notEnrolled: students.filter((s) => s.courseIds.length === 0).length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      if (statusFilter === 'disabled' ? !student.disabled : statusFilter !== 'all' && student.details.status !== statusFilter) return false;
      if (courseFilter !== 'all' && !student.courseIds.includes(courseFilter)) return false;
      return !q || [student.name, student.email, student.phone, student.details.studentCode, student.details.institution, student.details.guardianName].some((field) => field?.toLowerCase().includes(q));
    });
  }, [students, query, statusFilter, courseFilter]);

  const open = students.find((student) => student.id === openId) || null;

  const saveDraft = async () => {
    if (!draft) return;
    const payload = draft.id
      ? { action: 'update', id: draft.id, name: draft.name, phone: draft.phone, details: draft.details }
      : { action: 'create', name: draft.name, email: draft.email, phone: draft.phone, password: draft.password, details: draft.details,
        enrollments: draft.enrollments.filter((item) => item.courseId).map((item) => ({ ...item, amount: item.amount === '' ? undefined : Number(item.amount) })) };
    const data = await post(payload);
    if (!data) return;
    toast.success(draft.id ? 'Student updated' : 'Student added');
    if (!draft.id && data.password) setCredentials({ email: draft.email, password: data.password });
    setDraft(null);
  };

  const setDetails = (patch: Partial<Details>) => draft && setDraft({ ...draft, details: { ...draft.details, ...patch } });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total students', value: stats.total, icon: Users, tone: 'bg-slate-900 text-white' },
          { label: 'Active', value: stats.active, icon: UserCheck, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Joined this month', value: stats.newThisMonth, icon: UserPlus, tone: 'bg-sky-50 text-sky-800' },
          { label: 'Not enrolled yet', value: stats.notEnrolled, icon: BookOpen, tone: 'bg-amber-50 text-amber-800' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <div><p className="font-display text-2xl font-extrabold">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold">Students</h2>
            <p className="text-sm text-slate-500">Every student account — from website sign-up or added here. Click a student to see courses, payments and results.</p>
          </div>
          <button type="button" onClick={() => { setNote(''); setDraft(blankDraft()); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add student</button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone, student ID…" className="w-full bg-transparent text-sm focus:outline-none" />
          </label>
          <select aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            {(['Active', 'Paused', 'Completed', 'Dropped'] as Status[]).map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="disabled">Login disabled</option>
          </select>
          <select aria-label="Course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="all">All courses</option>
            {outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading students…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 font-semibold text-slate-700">{students.length ? 'No students match' : 'No students yet'}</p>
            <p className="text-sm text-slate-500">{students.length ? 'Try a different search or filter.' : 'Students appear here when they sign up, or press “Add student”.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="py-2.5">Student</th><th>Contact</th><th>Courses</th><th>Status</th><th>Paid</th><th>Joined</th><th /></tr></thead>
              <tbody>
                {visible.map((student) => (
                  <tr key={student.id} onClick={() => { setOpenId(student.id); setTab('overview'); loadRecord(student.id); }} className="cursor-pointer border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-[#FACC15]">{initials(student.name)}</span>
                        <div className="min-w-0"><p className="truncate font-bold">{student.name}</p><p className="text-xs text-slate-500">{student.details.studentCode || '—'}</p></div>
                      </div>
                    </td>
                    <td><p className="truncate text-sm">{student.email}</p><p className="text-xs text-slate-500">{student.phone || '—'}</p></td>
                    <td>{student.courseIds.length ? <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-xs font-bold text-[#A16207]">{student.courseIds.length} course{student.courseIds.length > 1 ? 's' : ''}</span> : <span className="text-xs text-slate-400">None</span>}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusTone[student.details.status]}`}>{student.details.status}</span>
                      {student.disabled && <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">Disabled</span>}
                    </td>
                    <td className="font-semibold">{student.paid ? taka(student.paid) : '—'}</td>
                    <td className="text-xs text-slate-500">{day(student.createdAt)}</td>
                    <td><ChevronRight className="h-4 w-4 text-slate-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Student profile drawer ── */}
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/40" onClick={() => setOpenId(null)}>
          <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <header className="space-y-4 border-b border-slate-100 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-lg font-bold text-[#FACC15]">{initials(open.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-extrabold">{open.name}</p>
                  <p className="text-xs text-slate-500">{open.details.studentCode} · joined {day(open.createdAt)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone[open.details.status]}`}>{open.details.status}</span>
                    {open.disabled && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">Login disabled</span>}
                  </div>
                </div>
                <button type="button" onClick={() => setOpenId(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setNote(''); setDraft({ id: open.id, name: open.name, email: open.email, phone: open.phone, password: '', details: { ...open.details }, enrollments: [] }); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-3 py-2 text-xs font-bold text-white"><Pencil className="h-3.5 w-3.5" />Edit details</button>
                <button type="button" disabled={saving} onClick={async () => { if (!confirm(`Create a new password for ${open.name}?`)) return; const data = await post({ action: 'reset-password', id: open.id }); if (data?.password) setCredentials({ email: open.email, password: data.password }); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><KeyRound className="h-3.5 w-3.5" />Reset password</button>
                <button type="button" disabled={saving} onClick={async () => { if (confirm(open.disabled ? 'Allow this student to log in again?' : 'Stop this student from logging in? Their records are kept.') && await post({ action: 'disable', id: open.id, disabled: !open.disabled })) toast.success(open.disabled ? 'Login enabled' : 'Login disabled'); }} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${open.disabled ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-rose-200 text-rose-700 hover:bg-rose-50'}`}>{open.disabled ? <UserCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}{open.disabled ? 'Enable login' : 'Disable login'}</button>
              </div>
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                {(['overview', 'courses', 'payments', 'results'] as const).map((key) => (
                  <button key={key} type="button" onClick={() => setTab(key)} className={`flex-1 rounded-lg px-2 py-1.5 capitalize ${tab === key ? 'bg-white shadow-sm' : 'text-slate-500'}`}>{key}</button>
                ))}
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
              {tab === 'overview' && (
                <>
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><a href={`mailto:${open.email}`} className="hover:underline">{open.email}</a></p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{open.phone ? <a href={`tel:${open.phone}`} className="hover:underline">{open.phone}</a> : '—'}</p>
                    {(open.details.address || open.details.city) && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{[open.details.address, open.details.city].filter(Boolean).join(', ')}</p>}
                  </div>
                  <dl className="grid grid-cols-2 gap-3">
                    {[
                      ['Date of birth', open.details.dateOfBirth ? day(open.details.dateOfBirth) : '—'], ['Gender', open.details.gender || '—'],
                      ['Education', open.details.educationLevel || '—'], ['Institution', open.details.institution || '—'],
                      ['Occupation', open.details.occupation || '—'], ['Came from', open.details.source || '—'],
                    ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-100 p-3"><dt className="text-[11px] font-bold uppercase text-slate-400">{label}</dt><dd className="font-semibold text-slate-800">{value}</dd></div>)}
                  </dl>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase text-slate-400">Guardian</p>
                    {open.details.guardianName ? (
                      <p className="font-semibold">{open.details.guardianName}{open.details.guardianRelation ? ` (${open.details.guardianRelation})` : ''}<span className="block text-xs font-normal text-slate-500">{[open.details.guardianPhone, open.details.guardianEmail].filter(Boolean).join(' · ')}</span></p>
                    ) : <p className="text-slate-500">Not added</p>}
                  </div>
                  {open.details.notes && <div className="whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-amber-900"><p className="mb-1 text-[11px] font-bold uppercase text-amber-700">Admin notes</p>{open.details.notes}</div>}
                </>
              )}

              {tab === 'courses' && (
                <>
                  {open.courseIds.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">Not enrolled in any course yet.</p> : (
                    <div className="space-y-2">
                      {open.courseIds.map((id) => (
                        <div key={id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                          <BookOpen className="h-4 w-4 shrink-0 text-amber-600" />
                          <p className="min-w-0 flex-1 truncate font-semibold">{courseTitle(id)}</p>
                          <button type="button" onClick={async () => { if (confirm(`Remove access to "${courseTitle(id)}"? Payments stay in the records.`) && await post({ action: 'unenroll', id: open.id, courseId: id })) toast.success('Access removed'); }} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Remove access"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4">
                    <p className="font-bold">Enroll in a course</p>
                    <select className={fieldClass} value={enrollDraft.courseId} onChange={(e) => setEnrollDraft({ ...enrollDraft, courseId: e.target.value })}>
                      <option value="">Choose course</option>
                      {outline.filter((course) => !open.courseIds.includes(course.id)).map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                    <div className="flex gap-2 text-xs font-bold">
                      {(['paid', 'free'] as const).map((key) => <button key={key} type="button" onClick={() => setEnrollDraft({ ...enrollDraft, payment: key })} className={`flex-1 rounded-xl border px-3 py-2 ${enrollDraft.payment === key ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-200'}`}>{key === 'paid' ? 'Paid (record payment)' : 'Free access'}</button>)}
                    </div>
                    {enrollDraft.payment === 'paid' && (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <select className={fieldClass} value={enrollDraft.method} onChange={(e) => setEnrollDraft({ ...enrollDraft, method: e.target.value })}>{['Cash', 'Personal bKash', 'Personal Nagad', 'Personal Rocket', 'Bank transfer'].map((m) => <option key={m}>{m}</option>)}</select>
                        <input className={fieldClass} type="number" min={0} placeholder="Amount (blank = price)" value={enrollDraft.amount} onChange={(e) => setEnrollDraft({ ...enrollDraft, amount: e.target.value })} />
                        <input className={fieldClass} placeholder="TrxID / receipt no." value={enrollDraft.transactionId} onChange={(e) => setEnrollDraft({ ...enrollDraft, transactionId: e.target.value })} />
                      </div>
                    )}
                    <button type="button" disabled={!enrollDraft.courseId || saving} onClick={async () => { if (await post({ action: 'enroll', id: open.id, ...enrollDraft, amount: enrollDraft.amount === '' ? undefined : Number(enrollDraft.amount) })) { toast.success('Enrolled'); setEnrollDraft({ courseId: '', payment: 'paid', method: 'Cash', amount: '', transactionId: '' }); loadRecord(open.id); } }} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-bold text-[#111827] disabled:opacity-40">Enroll</button>
                  </div>
                </>
              )}

              {tab === 'payments' && (
                !record ? <p className="text-slate-500">Loading…</p> : record.payments.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-slate-500">No payments yet.</p> : (
                  <div className="space-y-2">
                    {record.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                        <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{payment.courseTitle}</p><p className="text-xs text-slate-500">{payment.method}{payment.transactionId ? ` · ${payment.transactionId}` : ''} · {day(payment.createdAt)}</p></div>
                        <div className="text-right"><p className="font-bold">{taka(payment.amount)}</p><p className="text-[11px] font-semibold capitalize text-slate-500">{payment.status}</p></div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === 'results' && (
                !record ? <p className="text-slate-500">Loading…</p> : (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase text-slate-400">Exams</p>
                      {record.examAttempts.length === 0 ? <p className="text-slate-500">No exams taken.</p> : record.examAttempts.map((attempt) => (
                        <p key={attempt.id} className="flex justify-between border-b border-slate-50 py-1.5"><span>{day(attempt.submittedAt)}</span><span className={attempt.passed ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>{attempt.score}/{attempt.total} · {attempt.percent}%</span></p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase text-slate-400">Assignments</p>
                      {record.submissions.length === 0 ? <p className="text-slate-500">No submissions.</p> : record.submissions.map((item) => (
                        <p key={item.id} className="flex justify-between gap-3 border-b border-slate-50 py-1.5"><span className="truncate">{item.assignmentTitle}</span><span className="shrink-0 font-semibold">{item.status === 'graded' ? `${item.score}/${item.maxScore}` : item.status === 'needs-changes' ? 'Changes asked' : 'To review'}</span></p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase text-slate-400">Quizzes</p>
                      {record.quizAttempts.length === 0 ? <p className="text-slate-500">No quizzes taken.</p> : (
                        <p>{record.quizAttempts.length} attempt{record.quizAttempts.length > 1 ? 's' : ''} · average {Math.round(record.quizAttempts.reduce((sum, a) => sum + a.percent, 0) / record.quizAttempts.length)}% · {record.quizAttempts.filter((a) => a.passed).length} passed</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ── Add / edit student ── */}
      {draft && (
        <AdminModal wide title={draft.id ? 'Edit student' : 'Add student'} onClose={() => setDraft(null)}>
          <div className="space-y-4">
            <Section title="Account" hint={draft.id ? 'The email is the login and cannot be changed here.' : 'The student logs in with this email and password.'}>
              <Field label="Full name *"><input className={fieldClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Ayesha Rahman" /></Field>
              <Field label="Phone *"><input className={fieldClass} inputMode="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="01XXXXXXXXX" /></Field>
              <Field label="Email *"><input className={fieldClass} type="email" disabled={Boolean(draft.id)} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="student@email.com" /></Field>
              {!draft.id && <Field label="Password"><input className={fieldClass} value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="Leave blank to create one" /></Field>}
            </Section>

            <Section title="Personal details">
              <Field label="Date of birth"><input type="date" className={fieldClass} value={draft.details.dateOfBirth} onChange={(e) => setDetails({ dateOfBirth: e.target.value })} /></Field>
              <Field label="Gender">
                <select className={fieldClass} value={draft.details.gender} onChange={(e) => setDetails({ gender: e.target.value as Details['gender'] })}>
                  <option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <Field label="Address" wide><input className={fieldClass} value={draft.details.address} onChange={(e) => setDetails({ address: e.target.value })} placeholder="House, road, area" /></Field>
              <Field label="City / district"><input className={fieldClass} value={draft.details.city} onChange={(e) => setDetails({ city: e.target.value })} placeholder="e.g. Dhaka" /></Field>
              <Field label="Occupation"><input className={fieldClass} value={draft.details.occupation} onChange={(e) => setDetails({ occupation: e.target.value })} placeholder="Student, job holder, business…" /></Field>
            </Section>

            <Section title="Education">
              <Field label="Highest level">
                <select className={fieldClass} value={draft.details.educationLevel} onChange={(e) => setDetails({ educationLevel: e.target.value })}>
                  <option value="">Choose</option>{EDUCATION.map((level) => <option key={level}>{level}</option>)}
                </select>
              </Field>
              <Field label="School / college / university"><input className={fieldClass} value={draft.details.institution} onChange={(e) => setDetails({ institution: e.target.value })} /></Field>
            </Section>

            <Section title="Guardian / emergency contact" hint="Optional — useful for younger students.">
              <Field label="Name"><input className={fieldClass} value={draft.details.guardianName} onChange={(e) => setDetails({ guardianName: e.target.value })} /></Field>
              <Field label="Relation"><input className={fieldClass} value={draft.details.guardianRelation} onChange={(e) => setDetails({ guardianRelation: e.target.value })} placeholder="Father, mother, spouse…" /></Field>
              <Field label="Phone"><input className={fieldClass} inputMode="tel" value={draft.details.guardianPhone} onChange={(e) => setDetails({ guardianPhone: e.target.value })} /></Field>
              <Field label="Email"><input className={fieldClass} type="email" value={draft.details.guardianEmail} onChange={(e) => setDetails({ guardianEmail: e.target.value })} /></Field>
            </Section>

            {!draft.id && (
              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div><p className="font-bold text-slate-900">Enroll in courses</p><p className="text-xs text-slate-500">Optional. A paid enrollment is recorded in Payments and opens the course straight away.</p></div>
                {draft.enrollments.map((item, index) => (
                  <div key={index} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_120px_auto]">
                    <select className={fieldClass} value={item.courseId} onChange={(e) => setDraft({ ...draft, enrollments: draft.enrollments.map((row, i) => (i === index ? { ...row, courseId: e.target.value } : row)) })}>
                      <option value="">Choose course</option>{outline.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                    </select>
                    <select className={fieldClass} value={item.payment} onChange={(e) => setDraft({ ...draft, enrollments: draft.enrollments.map((row, i) => (i === index ? { ...row, payment: e.target.value as Enrollment['payment'] } : row)) })}>
                      <option value="paid">Paid</option><option value="free">Free</option>
                    </select>
                    <button type="button" onClick={() => setDraft({ ...draft, enrollments: draft.enrollments.filter((_, i) => i !== index) })} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Remove"><Trash2 className="h-4 w-4" /></button>
                    {item.payment === 'paid' && (
                      <div className="grid gap-2 sm:col-span-3 sm:grid-cols-3">
                        <select className={fieldClass} value={item.method} onChange={(e) => setDraft({ ...draft, enrollments: draft.enrollments.map((row, i) => (i === index ? { ...row, method: e.target.value } : row)) })}>{['Cash', 'Personal bKash', 'Personal Nagad', 'Personal Rocket', 'Bank transfer'].map((m) => <option key={m}>{m}</option>)}</select>
                        <input className={fieldClass} type="number" min={0} placeholder="Amount (blank = price)" value={item.amount} onChange={(e) => setDraft({ ...draft, enrollments: draft.enrollments.map((row, i) => (i === index ? { ...row, amount: e.target.value } : row)) })} />
                        <input className={fieldClass} placeholder="TrxID / receipt no." value={item.transactionId} onChange={(e) => setDraft({ ...draft, enrollments: draft.enrollments.map((row, i) => (i === index ? { ...row, transactionId: e.target.value } : row)) })} />
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setDraft({ ...draft, enrollments: [...draft.enrollments, { courseId: '', payment: 'paid', method: 'Cash', amount: '', transactionId: '' }] })} className="text-sm font-bold text-amber-700 hover:underline">+ Add a course</button>
              </div>
            )}

            <Section title="Admin">
              <Field label="Status">
                <select className={fieldClass} value={draft.details.status} onChange={(e) => setDetails({ status: e.target.value as Status })}>
                  {(['Active', 'Paused', 'Completed', 'Dropped'] as Status[]).map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="How did they find us?">
                <select className={fieldClass} value={draft.details.source} onChange={(e) => setDetails({ source: e.target.value })}>
                  <option value="">Choose</option>{SOURCES.map((source) => <option key={source}>{source}</option>)}
                </select>
              </Field>
              <Field label="Notes (only admins see this)" wide><textarea className={fieldClass} rows={3} value={draft.details.notes} onChange={(e) => setDetails({ notes: e.target.value })} /></Field>
            </Section>

            {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
            <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" disabled={saving} onClick={saveDraft} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create student'}</button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ── One-time credentials ── */}
      {credentials && (
        <AdminModal title="Login details" onClose={() => setCredentials(null)}>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">Share these with the student. The password is shown only once — they can change it after logging in.</p>
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 font-mono">
              <p>Email: {credentials.email}</p>
              <p>Password: <strong>{credentials.password}</strong></p>
            </div>
            <button type="button" onClick={() => { navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`).then(() => toast.success('Copied')).catch(() => undefined); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white"><Copy className="h-4 w-4" />Copy</button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
