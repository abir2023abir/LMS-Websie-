'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MyProgressPanel from '@/components/student/MyProgressPanel';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import StudentShell, { type StudentNavKey } from '@/components/student/StudentShell';
import StudentOverview from '@/components/student/StudentOverview';
import CertificateModal from '@/components/student/CertificateModal';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import CampusMessageForm from '@/components/messages/CampusMessageForm';
import GuardianRequests from '@/components/student/GuardianRequests';
import {
  getEnrolledCoursesWithProgress,
  type EnrolledCourseWithProgress,
} from '@/lib/progress';
import {
  BookOpen,
  GraduationCap,
  Award,
  LogOut,
  PlayCircle,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Download,
  Clock,
  Check,
  ChevronsRight,
  Flame,
} from 'lucide-react';

const PARTS: Record<string, { key: StudentNavKey; title: string }> = {
  overview: { key: 'overview', title: 'Overview' },
  courses: { key: 'courses', title: 'My Courses' },
  calendar: { key: 'calendar', title: 'Calendar' },
  progress: { key: 'progress', title: 'My Progress' },
  certificates: { key: 'certificates', title: 'Certificates' },
  messages: { key: 'messages', title: 'Messages' },
};

export default function StudentDashboardPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <StudentDashboard />
    </Suspense>
  );
}

function StudentDashboard() {
  const part = PARTS[useSearchParams().get('tab') || ''] || PARTS.overview;
  const { userProfile, user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'certificates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPayments, setPendingPayments] = useState<{ id: string; courseTitle: string; method: string }[]>([]);
  const [justPaid, setJustPaid] = useState(false);

  // Selected Certificate Modal State
  const [selectedCertCourse, setSelectedCertCourse] = useState<EnrolledCourseWithProgress | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      const userId = user?.uid || 'local_student';
      const list = await getEnrolledCoursesWithProgress(userId);
      setEnrolledCourses(list);
      setLoading(false);
      fetch('/api/student/enrollments', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setPendingPayments(data?.pending || []))
        .catch(() => undefined);
    }

    setJustPaid(new URLSearchParams(window.location.search).get('payment') === 'success');

    loadStudentData();
  }, [user]);

  // Filtered courses
  const filteredCourses = enrolledCourses.filter((item) => {
    const matchesSearch =
      item.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.course.category && item.course.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'in_progress') {
      return item.progress.progressPercentage < 100;
    }
    if (activeTab === 'completed' || part.key === 'certificates') {
      return item.progress.progressPercentage >= 100;
    }
    return true;
  });

  const completedCount = enrolledCourses.filter((c) => c.progress.progressPercentage >= 100).length;
  const inProgressCount = enrolledCourses.filter((c) => c.progress.progressPercentage < 100).length;

  const handleOpenCertificate = (item: EnrolledCourseWithProgress) => {
    setSelectedCertCourse(item);
    setIsCertModalOpen(true);
  };

  const name = userProfile?.name || user?.displayName || 'Learner';
  const subtitle = enrolledCourses.length
    ? `${enrolledCourses.length} course${enrolledCourses.length === 1 ? '' : 's'} in progress · Career Bridge.Studio student`
    : 'Career Bridge.Studio student · explore a course to get started';

  return (
    <AuthGuard allowedRole="Student">
      <StudentShell active={part.key} title={part.title}>
          {justPaid && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Payment received — your course is now open below.</div>
          )}
          {pendingPayments.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">Waiting for payment approval</p>
              <ul className="mt-1 list-disc pl-5">
                {pendingPayments.map((payment) => <li key={payment.id}>{payment.courseTitle} · {payment.method}</li>)}
              </ul>
              <p className="mt-1 text-xs">The course opens here as soon as we confirm your payment.</p>
            </div>
          )}

        {part.key === 'overview' && (
          <>
            <StudentOverview name={name} subtitle={subtitle} />
            <GuardianRequests />
          </>
        )}

        {(part.key === 'courses' || part.key === 'certificates') && (
          <div className="space-y-6">
            {part.key === 'certificates' && <p className="text-sm text-slate-600">Courses you finished. Open a certificate to download or print it.</p>}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Tabs */}
              <div className={`${part.key === 'certificates' ? 'hidden' : 'flex'} items-center gap-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm overflow-x-auto scrollbar-none`}>
                {[
                  { key: 'all', label: `All (${enrolledCourses.length})` },
                  { key: 'in_progress', label: `In Progress (${inProgressCount})` },
                  { key: 'completed', label: `Completed (${completedCount})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === key
                        ? 'bg-[#FACC15] text-[#111827] shadow-sm'
                        : 'text-slate-600 hover:text-[#111827]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter my courses…"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-500 font-medium">Loading your enrolled courses…</div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-lg text-[#111827]">No Courses Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery ? 'No courses match your filter query.' : 'You have not enrolled in any courses in this section yet.'}
                </p>
                <Link
                  href="/courses"
                  className="inline-block bg-[#FACC15] text-[#111827] font-bold text-xs px-6 py-2.5 rounded-xl shadow"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((item) => {
                  const is100 = item.progress.progressPercentage >= 100;

                  return (
                    <div
                      key={item.course.id}
                      className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#FACC15] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Image */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <Image
                          src={item.course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop'}
                          alt={item.course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3.5 left-3.5 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                          {item.course.category || 'Course'}
                        </span>
                        {is100 && (
                          <span className="absolute top-3.5 right-3.5 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> 100% Completed
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-base text-[#111827] line-clamp-2 group-hover:text-amber-600 transition-colors">
                            {item.course.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {item.course.description}
                          </p>
                        </div>

                        {/* Progress */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                            <span>{item.completedLessonsCount} / {item.totalLessons} Lectures</span>
                            <span className="text-[#111827] font-bold">{item.progress.progressPercentage}%</span>
                          </div>

                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                is100 ? 'bg-emerald-500' : 'bg-[#FACC15]'
                              }`}
                              style={{ width: `${item.progress.progressPercentage}%` }}
                            />
                          </div>

                          {/* Actions */}
                          <div className="pt-2 flex items-center gap-2">
                            <Link
                              href={`/student/learn/${item.course.id}`}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs py-2.5 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>{is100 ? 'Review Classroom' : 'Continue'}</span>
                            </Link>

                            {is100 && (
                              <button
                                onClick={() => handleOpenCertificate(item)}
                                className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center gap-1"
                                title="Download Official Diploma"
                              >
                                <Award className="w-4 h-4" />
                                <span>Certificate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {part.key === 'calendar' && <DashboardCalendar />}
        {part.key === 'progress' && <MyProgressPanel />}
        {part.key === 'messages' && (
          <section className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6">
            <CampusMessageForm kind="student" lockedKind defaultName={name} defaultEmail={user?.email || ''} courses={enrolledCourses.map((item) => ({ id: String(item.course.id), title: item.course.title }))} />
          </section>
        )}

        {/* ── CERTIFICATE MODAL ── */}
        {selectedCertCourse && (
          <CertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            courseId={String(selectedCertCourse.course.id)}
          />
        )}
      </StudentShell>
    </AuthGuard>
  );
}
