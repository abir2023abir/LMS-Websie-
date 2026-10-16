'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { useAuth } from '@/context/AuthContext';
import { getEnrolledCoursesWithProgress, type EnrolledCourseWithProgress } from '@/lib/progress';
import { Shield, LogOut, BookOpen } from 'lucide-react';
import WorkspaceLinks from '@/components/workspace/WorkspaceLinks';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import InboxButton from '@/components/inbox/InboxButton';
import { allAssignments, attemptsFor } from '@/lib/workspace';

const LOCAL_USERS_KEY = 'learnverse_registered_users';

interface LinkedStudent {
  uid: string;
  name: string;
  email: string;
}

function findStudent(email: string): LinkedStudent | null {
  if (typeof window === 'undefined') return null;
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const found = users.find(
      (u: { email?: string; role?: string }) =>
        u.email?.toLowerCase() === email.toLowerCase() && u.role !== 'Guardian'
    );
    if (!found) return null;
    return { uid: found.uid, name: found.name || found.email, email: found.email };
  } catch {
    return null;
  }
}

export default function GuardianPage() {
  return (
    <AuthGuard allowedRole="Guardian">
      <GuardianHome />
    </AuthGuard>
  );
}

function GuardianHome() {
  const { userProfile, logout, linkGuardianToStudent } = useAuth();
  const [email, setEmail] = useState(userProfile?.linkedStudentEmail || '');
  const [student, setStudent] = useState<LinkedStudent | null>(null);
  const [courses, setCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const linked = userProfile?.linkedStudentEmail;
    if (!linked) {
      setStudent(null);
      setCourses([]);
      return;
    }
    const match = findStudent(linked);
    setStudent(match);
    if (!match) {
      setCourses([]);
      return;
    }
    getEnrolledCoursesWithProgress(match.uid).then(setCourses).catch(() => setCourses([]));
  }, [userProfile?.linkedStudentEmail]);

  const saveLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      await linkGuardianToStudent(email);
    } finally {
      setSaving(false);
    }
  };

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
              You can see only the student linked to this account.
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
        <DashboardCalendar />
        <WorkspaceLinks />
        <form onSubmit={saveLink} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <label htmlFor="student-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Linked student
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
              {saving ? 'Saving' : 'Save link'}
            </button>
          </div>
        </form>

        {!userProfile?.linkedStudentEmail && (
          <p className="text-sm text-slate-600">No student is linked yet. Other students stay hidden.</p>
        )}

        {userProfile?.linkedStudentEmail && !student && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="font-bold">Linked to {userProfile.linkedStudentEmail}</p>
            <p className="text-sm text-slate-600 mt-1">
              That student account is not on this browser yet. No other student is shown.
            </p>
          </div>
        )}

        {student && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</p>
              <h2 className="font-display font-extrabold text-2xl mt-1">{student.name}</h2>
              <p className="text-sm text-slate-600">{student.email}</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
              <h3 className="font-bold">Results</h3>
              {attemptsFor(student.email).map((item) => (
                <p key={item.id} className="text-sm">{item.score}/{item.total} · {item.passed ? 'pass' : 'fail'}</p>
              ))}
              {attemptsFor(student.email).length === 0 && <p className="text-sm text-slate-600">No exam yet.</p>}
              <h3 className="font-bold pt-2">Assignments</h3>
              {allAssignments().filter((item) => item.email.toLowerCase() === student.email.toLowerCase()).map((item) => (
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
