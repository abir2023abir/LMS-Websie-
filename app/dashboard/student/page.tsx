'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import Button from '@/components/ui/Button';
import { featuredCourses } from '@/lib/data';
import type { CourseSchema } from '@/types/course';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  LogOut,
  CheckCircle,
  PlayCircle,
  Sparkles,
  Printer,
  ShieldCheck,
  Flame,
  Calendar,
  FileCheck,
} from 'lucide-react';
import Image from 'next/image';

interface EnrolledCourseItem {
  course: CourseSchema;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
}

export default function StudentDashboard() {
  const { userProfile, user, logout } = useAuth();
  const [enrolledList, setEnrolledList] = useState<EnrolledCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'courses' | 'certificates' | 'quizzes'>('courses');

  useEffect(() => {
    const initialEnrolled: EnrolledCourseItem[] = featuredCourses.slice(0, 3).map((c, index) => {
      const total = c.lessonCount || 20;
      const completed = index === 0 ? 20 : index === 1 ? 8 : 3; // First course 100% completed
      return {
        course: {
          id: c.id,
          title: c.title,
          description: c.description,
          instructorId: c.instructor.name,
          instructorName: c.instructor.name,
          price: c.price,
          thumbnail: c.thumbnail,
          category: c.category,
          level: c.level,
        },
        completedLessons: completed,
        totalLessons: total,
        lastAccessed: 'Recently',
      };
    });

    setEnrolledList(initialEnrolled);
    setLoading(false);
  }, []);

  const totalCompletedCount = enrolledList.filter(
    (e) => e.completedLessons >= e.totalLessons
  ).length;

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-[#0d131f] text-white flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
        <FloatingNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full flex-1">
          {/* ── WELCOME HERO BANNER ── */}
          <div className="bg-gradient-to-br from-[#1F1641] via-[#151b2e] to-[#0d131f] rounded-3xl border border-white/10 p-6 sm:p-10 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FACC15]/10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-[#FACC15]/30">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FACC15]/20 text-[#FACC15] text-xs font-bold mb-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Certified English Learner
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    Welcome back, {userProfile?.name || user?.displayName || 'Learner'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/courses"
                  className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#FACC15]/20"
                >
                  Explore Catalog
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── METRICS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-display font-extrabold text-3xl text-white">{enrolledList.length}</div>
              <div className="text-xs text-slate-400 font-medium">Active Enrolled Courses</div>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FACC15]/20 text-[#FACC15] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div className="font-display font-extrabold text-3xl text-[#FACC15]">7 Days</div>
              <div className="text-xs text-slate-400 font-medium">Daily Learning Streak 🔥</div>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="font-display font-extrabold text-3xl text-white">{totalCompletedCount}</div>
              <div className="text-xs text-slate-400 font-medium">Courses Completed (100%)</div>
            </div>

            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-display font-extrabold text-3xl text-[#FACC15]">1 Earned</div>
              <div className="text-xs text-slate-400 font-medium">Official Certificate Issued</div>
            </div>
          </div>

          {/* ── DASHBOARD SECTION TABS ── */}
          <div className="bg-[#111827] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
              {[
                { key: 'courses', label: 'My Enrolled Courses', icon: BookOpen },
                { key: 'certificates', label: 'My Certificates (1)', icon: Award },
                { key: 'quizzes', label: 'Quiz Progress & Scores', icon: FileCheck },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveDashboardTab(key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeDashboardTab === key
                      ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/20'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* ── TAB 1: MY COURSES ── */}
            {activeDashboardTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Jump right back into your video lectures and interactive drills
                  </p>
                  <span className="text-xs text-[#FACC15] font-bold">
                    {enrolledList.length} Active Courses
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledList.map(({ course, completedLessons, totalLessons }) => {
                    const percent = Math.round((completedLessons / totalLessons) * 100);

                    return (
                      <div
                        key={course.id}
                        className="bg-[#1a2234] rounded-2xl border border-white/10 hover:border-[#FACC15]/40 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-video bg-dark-700">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute top-3 left-3 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md">
                            {course.category}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-display font-bold text-white text-base leading-snug line-clamp-2 mb-1">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-400">
                              Instructor: {course.instructorName || 'Lead Educator'}
                            </p>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Completion Progress</span>
                              <span className="text-[#FACC15] font-extrabold">
                                {completedLessons} / {totalLessons} lectures ({percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="bg-[#FACC15] h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          <Link
                            href={`/learn/${course.id}`}
                            className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FACC15]/20"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Continue Classroom</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 2: MY CERTIFICATES ── */}
            {activeDashboardTab === 'certificates' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center shadow-lg shadow-[#FACC15]/30">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-white">
                        Comprehensive Conversation & Fluency Mastery
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Issued: August 18, 2026 • Certificate ID: <strong className="text-[#FACC15]">EC-2026-8921</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/verify-certificate"
                    className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#FACC15]/20 flex-shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View & Print Diploma</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 3: QUIZ PERFORMANCE ── */}
            {activeDashboardTab === 'quizzes' && (
              <div className="space-y-4">
                {[
                  { title: 'Module 1: Tenses & Active Pronunciation Drills', score: '3 / 3 (100%)', status: 'Passed (Grade A+)', date: 'Today' },
                  { title: 'Module 2: Professional Business Email Etiquette', score: '3 / 3 (100%)', status: 'Passed (Grade A+)', date: 'Yesterday' },
                ].map((q, idx) => (
                  <div key={idx} className="bg-[#1a2234] border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{q.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Evaluated: {q.date}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-extrabold block text-sm">{q.score}</span>
                      <span className="text-[10px] text-emerald-300">{q.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <EnglishFooter />
      </div>
    </AuthGuard>
  );
}
