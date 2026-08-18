'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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

  useEffect(() => {
    // Populate mock enrolled courses for the student dashboard
    const initialEnrolled: EnrolledCourseItem[] = featuredCourses.slice(0, 3).map((c, index) => {
      const total = c.lessonCount || 20;
      const completed = index === 0 ? 14 : index === 1 ? 8 : 2;
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

  // Compute total completed courses & hours
  const totalCompletedCount = enrolledList.filter(
    (e) => e.completedLessons >= e.totalLessons
  ).length;

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-dark-900 flex flex-col justify-between">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full flex-1">
          {/* Welcome Banner */}
          <div className="glass rounded-3xl border border-white/10 p-8 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/15 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-gradient flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-600/40">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold mb-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Student Account
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    Welcome back, {userProfile?.name || user?.displayName || 'Learner'}!
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/courses">
                  <Button variant="outline" size="md">
                    Explore Courses
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={logout}
                  leftIcon={<LogOut className="w-4 h-4 text-slate-400" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">{enrolledList.length}</div>
              <div className="text-xs text-slate-400 mt-1">Enrolled Courses</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">24.5 hrs</div>
              <div className="text-xs text-slate-400 mt-1">Total Learning Time</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">{totalCompletedCount}</div>
              <div className="text-xs text-slate-400 mt-1">Completed Courses</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">1</div>
              <div className="text-xs text-slate-400 mt-1">Certificates Earned</div>
            </div>
          </div>

          {/* ── MY ENROLLED COURSES GRID WITH PROGRESS BARS ── */}
          <div className="glass rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">My Enrolled Courses</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Track your video lecture progress and jump right back into learning
                </p>
              </div>
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {enrolledList.length} Active Courses
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading your courses...
              </div>
            ) : enrolledList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm glass rounded-2xl border border-white/5">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>You have not enrolled in any courses yet.</p>
                <Link href="/courses" className="mt-4 inline-block">
                  <Button variant="primary" size="sm">Browse Course Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledList.map(({ course, completedLessons, totalLessons }) => {
                  const percent = Math.round((completedLessons / totalLessons) * 100);

                  return (
                    <div
                      key={course.id}
                      className="glass rounded-2xl border border-white/8 hover:border-primary-500/30 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
                    >
                      {/* Course Card Top Header */}
                      <div className="relative aspect-video bg-dark-700">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                        <span className="absolute top-3 left-3 badge bg-violet-500/80 text-white backdrop-blur-md">
                          {course.category || 'Web Dev'}
                        </span>
                      </div>

                      {/* Course Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-display font-semibold text-white text-base leading-snug line-clamp-2 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Instructor: {course.instructorName || 'Lead Educator'}
                          </p>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Progress</span>
                            <span className="text-primary-300 font-semibold">
                              {completedLessons} / {totalLessons} lessons ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="bg-primary-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link href={`/learn/${course.id}`} className="block pt-2">
                          <Button
                            variant="primary"
                            size="md"
                            fullWidth
                            leftIcon={<PlayCircle className="w-4 h-4" />}
                          >
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
