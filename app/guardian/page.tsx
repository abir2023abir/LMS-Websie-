'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { useAuth } from '@/context/AuthContext';
import { getEnrolledCoursesWithProgress, type EnrolledCourseWithProgress } from '@/lib/progress';
import { Shield, LogOut, BookOpen, CalendarCheck, CalendarClock } from 'lucide-react';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import InboxButton from '@/components/inbox/InboxButton';
import { allAssignments, attemptsFor, events } from '@/lib/workspace';

type LinkRequest = { id: string; student_email: string; status: 'pending' | 'approved' | 'rejected' };
type Student = { id: string; name: string; email: string };

export default function GuardianPage() {
  return (
    <AuthGuard allowedRole="Guardian">
      <GuardianHome />
    </AuthGuard>
  );
}

function GuardianHome() {
  const { userProfile, logout, linkGuardianToStudent } = useAuth();
  const [email, setEmail] = useState('');
  const [links, setLinks] = useState<LinkRequest[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<string[]>([]);
  const [courses, setCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const linkRes = await fetch('/api/guardian/links').then((res) => res.json()).catch(() => ({}));
    setLinks(linkRes.asGuardian || []);
    const res = await fetch('/api/guardian/student');
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.student) {
      setStudent(null);
      setAttendance([]);
      setCourses([]);
      return;
    }
    setStudent(data.student);
    setAttendance(data.attendance || []);
    getEnrolledCoursesWithProgress(data.student.id).then(setCourses).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setNote('');
    try {
      await linkGuardianToStudent(email);
      setEmail('');
      setNote('Request sent. The student or an admin must approve it.');
      await load();
    } catch (err: any) {
      setNote(err.message || 'Could not send the request.');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const last30 = attendance.filter((day) => day >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const upcomingExams = events()
    .filter((item) => item.kind === 'exam' && item.date.slice(0, 10) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pending = links.filter((item) => item.status === 'pending');
  const rejected = links.filter((item) => item.status === 'rejected');

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] text-white text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-[#FACC15]" /> Guardian Panel
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              {userProfile?.name || 'Guardian'}
            </h1>
            <p className="text-sm text-[#111827]/80 font-medium">
              You see only the student who approved your link.
            </p>
          </div>
          <InboxButton scope="own" />
          <button
            onClick={logout}
            className="p-3 rounded-full bg-white/40 hover:bg-rose-500 hover:text-white border border-black/10"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-6">
        <WorkspaceLinks />

        {!student && (
          <form onSubmit={saveLink} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <label htmlFor="student-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Link a student
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@email.com"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#111827]"
              />
              <button
                type="submit"
                disabled={saving}
                className="bg-[#111827] text-white font-extrabold text-sm px-5 py-3 rounded-xl disabled:opacity-50"
              >
                {saving ? 'Sending' : 'Send request'}
              </button>
            </div>
            {note && <p className="text-sm text-slate-600">{note}</p>}
            {pending.map((item) => (
              <p key={item.id} className="text-sm">
                Waiting for approval: <span className="font-bold">{item.student_email}</span>
              </p>
            ))}
            {rejected.map((item) => (
              <p key={item.id} className="text-sm text-rose-600">
                Not approved: {item.student_email}
              </p>
            ))}
            {links.length === 0 && <p className="text-sm text-slate-600">No student is linked yet. Other students stay hidden.</p>}
          </form>
        )}

        {student && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</p>
              <h2 className="font-display font-extrabold text-2xl mt-1">{student.name}</h2>
              <p className="text-sm text-slate-600">{student.email}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600" /> Attendance
                </h3>
                <p className="text-sm">
                  Present <span className="font-extrabold">{last30.length}</span> of the last 30 days
                </p>
                <p className="text-xs text-slate-500">
                  Last seen: {attendance.length ? attendance[attendance.length - 1] : 'not yet'}
                </p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
                <h3 className="font-bold flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-amber-600" /> Upcoming exams
                </h3>
                {upcomingExams.map((item) => (
                  <p key={item.id} className="text-sm">
                    {item.date.slice(0, 10)} · {item.title}
                  </p>
                ))}
                {upcomingExams.length === 0 && <p className="text-sm text-slate-600">No exam scheduled.</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
              <h3 className="font-bold">Results</h3>
              {attemptsFor(student.email).map((item) => (
                <p key={item.id} className="text-sm">{item.score}/{item.total} · {item.passed ? 'pass' : 'fail'}</p>
              ))}
              {attemptsFor(student.email).length === 0 && <p className="text-sm text-slate-600">No exam yet.</p>}
              <h3 className="font-bold pt-2">Assignments</h3>
              {allAssignments().filter((item) => item.email.toLowerCase() === student.email).map((item) => (
                <p key={`${item.lessonId}-${item.text}`} className="text-sm">{item.status}: {item.text}</p>
              ))}
            </div>

            {courses.length === 0 ? (
              <p className="text-sm text-slate-600">This student has no course progress yet.</p>
            ) : (
              <div className="grid gap-4">
                {courses.map((item) => (
                  <div key={item.course.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">{item.course.title}</p>
                        <p className="text-xs text-slate-500">{Math.round(item.progress.progressPercentage || 0)}% complete</p>
                      </div>
                    </div>
                    <Link href={`/courses/${item.course.id}`} className="text-xs font-bold text-[#111827] underline">
                      Course
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <EnglishFooter />
    </div>
  );
}
