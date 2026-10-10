'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import CertificateModal from '@/components/student/CertificateModal';
import {
  getEnrolledCoursesWithProgress,
  type EnrolledCourseWithProgress,
} from '@/lib/progress';
import {
  BookOpen,
  GraduationCap,
  Award,
  LogOut,
  CheckCircle,
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

export default function StudentDashboardPage() {
  const { userProfile, user, logout } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'certificates'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    }

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
    if (activeTab === 'completed' || activeTab === 'certificates') {
      return item.progress.progressPercentage >= 100;
    }
    return true;
  });

  const completedCount = enrolledCourses.filter((c) => c.progress.progressPercentage >= 100).length;
  const inProgressCount = enrolledCourses.filter((c) => c.progress.progressPercentage < 100).length;

  // Most recent in-progress course for the quick resume banner
  const resumeCourse =
    enrolledCourses.find((c) => c.progress.progressPercentage > 0 && c.progress.progressPercentage < 100) ||
    enrolledCourses[0];

  const handleOpenCertificate = (item: EnrolledCourseWithProgress) => {
    setSelectedCertCourse(item);
    setIsCertModalOpen(true);
  };

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
        <FloatingNavbar />

        {/* ── WELCOME HERO HEADER (HOMEPAGE GOLD/YELLOW GRADIENT) ── */}
        <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-14 px-4 sm:px-6 lg:px-8 text-[#111827]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#111827] text-[#FACC15] flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-xl shadow-black/20 flex-shrink-0">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] text-white text-xs font-bold shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FACC15]" /> Student Panel
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
                  Welcome back, {userProfile?.name || user?.displayName || 'Learner'}!
                </h1>
                <p className="text-xs sm:text-sm text-[#111827]/80 font-medium">
                  {user?.email || 'Logged in to English Capsules Learning Environment'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/courses"
                className="bg-[#111827] hover:bg-black text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full transition-all shadow-lg shadow-black/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FACC15]" />
                <span>Explore Capsules</span>
              </Link>
              <button
                onClick={logout}
                className="p-3 rounded-full bg-white/40 hover:bg-rose-500 hover:text-white text-[#111827] border border-black/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── MAIN DASHBOARD CONTENT ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-10">
          {/* ── METRICS OVERVIEW STATS (WHITE CARDS) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Enrolled</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">
                {enrolledCourses.length}
              </div>
              <div className="text-xs text-slate-500">Active English Capsules</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-amber-500" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  🔥 Active
                </span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">
                7 Days
              </div>
              <div className="text-xs text-slate-500">Daily Study Streak</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Completed</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">
                {completedCount}
              </div>
              <div className="text-xs text-slate-500">100% Finished Courses</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Diplomas</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">
                {completedCount}
              </div>
              <div className="text-xs text-slate-500">Verified Credentials Issued</div>
            </div>
          </div>

          {/* ── QUICK RESUME HERO CARD ── */}
          {resumeCourse && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <Image
                      src={resumeCourse.course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop'}
                      alt={resumeCourse.course.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                      Jump Back In • Ready to Learn
                    </div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#111827]">
                      {resumeCourse.course.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {resumeCourse.completedLessonsCount} of {resumeCourse.totalLessons} Lectures Completed ({resumeCourse.progress.progressPercentage}%)
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex items-center gap-3">
                  <Link
                    href={`/student/learn/${resumeCourse.course.id}`}
                    className="w-full lg:w-auto bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-[#FACC15]/20 flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4 fill-current" />
                    <span>Continue Classroom</span>
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#FACC15] rounded-full transition-all duration-500"
                    style={{ width: `${resumeCourse.progress.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── COURSE LIST & FILTER TABS ── */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
                {[
                  { key: 'all', label: `All (${enrolledCourses.length})` },
                  { key: 'in_progress', label: `In Progress (${inProgressCount})` },
                  { key: 'completed', label: `Completed (${completedCount})` },
                  { key: 'certificates', label: `Certificates (${completedCount})` },
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
                  placeholder="Filter my capsules..."
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="p-16 text-center text-slate-500 font-medium">Loading your enrolled courses...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-lg text-[#111827]">No Courses Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery ? 'No courses match your filter query.' : 'You have not enrolled in any capsules in this section yet.'}
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
                          {item.course.category || 'English Capsule'}
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
        </main>

        {/* ── CERTIFICATE MODAL ── */}
        {selectedCertCourse && (
          <CertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            courseTitle={selectedCertCourse.course.title}
            studentName={userProfile?.name || user?.displayName || 'Learner'}
            certificateId={selectedCertCourse.progress.certificateId || 'EC-2026-8921'}
            completedAt={selectedCertCourse.progress.completedAt || new Date().toISOString()}
          />
        )}

        <EnglishFooter />
      </div>
    </AuthGuard>
  );
}
