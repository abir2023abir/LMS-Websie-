'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import {
  Plus, LogOut, Shield, LayoutDashboard, BookOpen, Award, HelpCircle,
  Banknote, Users, FileText, Search, Trash2, RefreshCw, Eye,
  Sparkles, Inbox, MessageSquare
} from 'lucide-react';
import StatsCards from './StatsCards';
import RevenueAreaChart from './RevenueAreaChart';
import TopCoursesList from './TopCoursesList';
import InboxButton from '@/components/inbox/InboxButton';
import AdminCourseEditor from './AdminCourseEditor';
import AdminPaymentSetup from './AdminPaymentSetup';
import AdminQuizzes from './AdminQuizzes';
import AdminStudents from './AdminStudents';
import AdminRequests from './AdminRequests';
import AdminAssignments from './AdminAssignments';
import AdminCertificates from './AdminCertificates';
import AdminEarnings from './AdminEarnings';
import AdminPaymentsBoard from './AdminPaymentsBoard';
import AdminMessages from './AdminMessages';
import { takaFromUsd } from '@/lib/utils';

const navTabs = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Courses', icon: BookOpen },
  { name: 'Certificate', icon: Award },
  { name: 'Quizzes', icon: HelpCircle },
  { name: 'Earnings', icon: Banknote },
  { name: 'Students', icon: Users },
  { name: 'Requests', icon: Inbox },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Assignments', icon: FileText },
  { name: 'Payments', icon: Banknote },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');

  // SWR real-time polling every 4 seconds
  const { data, mutate, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });
  const { data: requestData } = useSWR('/api/admin/service-requests', fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });
  const serviceRequests = requestData?.requests || [];

  const stats = data?.stats || {};
  const coursesList = stats?.courses || [];
  const categoryDistribution = stats?.categoryDistribution || [];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.refresh();
    } catch {
      router.refresh();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const { deleteCourse } = await import('@/lib/db');
      await deleteCourse(courseId);
      mutate();
    } catch {
      mutate();
    }
  };

  // Filtered courses for search
  const filteredCourses = coursesList.filter((c: any) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── TOP HEADER (DARK NAVY / PURPLE #111827) ── */}
      <header className="bg-[#111827] text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center font-extrabold shadow-lg shadow-[#FACC15]/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-white tracking-wide block leading-none">
                  English Capsules
                </span>
                <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-widest leading-none">
                  Admin Panel • Live Database
                </span>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses, students, invoices..."
                className="bg-transparent text-white placeholder-slate-400 focus:outline-none w-full text-xs"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => mutate()}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors border border-white/10 flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh Realtime Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync DB</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#FACC15] text-[#111827] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white leading-none">Super Admin</div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5">Database Connected</div>
                </div>
              </div>

              <InboxButton scope="all" onDark />
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-200 hover:text-red-400 transition-colors border border-white/10"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nav Tabs & + Add Course Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.name;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FACC15] text-[#111827] shadow-lg shadow-[#FACC15]/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                    {tab.name === 'Requests' && serviceRequests.length > 0 && (
                      <span className={`ml-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center ${
                        isActive ? 'bg-[#111827] text-[#FACC15]' : 'bg-[#FACC15] text-[#111827]'
                      }`}>
                        {serviceRequests.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* + Add Course Button */}
            <Link
              href="/teacher"
              className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-[#FACC15]/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add English Capsule</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 relative z-20 space-y-8">
        
        {/* ── TAB 1: OVERVIEW (REAL DATABASE METRICS) ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {/* Dynamic Recharts KPI Cards */}
            <StatsCards stats={stats} />

            {/* Dynamic Revenue & Top Courses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <RevenueAreaChart data={stats.monthlyRevenue} />
              </div>
              <div className="lg:col-span-4">
                <TopCoursesList courses={stats.topCourses} />
              </div>
            </div>

            {/* Real-time Category Distribution from Database */}
            {categoryDistribution.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Live English Category Distribution (Database)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {coursesList.length} Active Courses
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-1">
                  {categoryDistribution.map((cat: any) => (
                    <div key={cat.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 truncate">{cat.name}</div>
                      <div className="font-display font-extrabold text-base text-slate-900">{cat.courses} Courses</div>
                      <div className="text-[11px] text-amber-600 font-semibold">{cat.students} Learners</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: COURSES MANAGEMENT ── */}
        {activeTab === 'Courses' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900">Manage Courses ({filteredCourses.length})</h2>
                <p className="text-xs text-slate-500">Live database inventory of all published English Capsules.</p>
              </div>
              <Link
                href="/teacher"
                className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-bold text-xs px-4 py-2 rounded-full"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Course</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Enrolled Learners</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-8 rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-100 border border-slate-200">
                            {course.thumbnail && (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 max-w-xs truncate">{course.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{takaFromUsd(course.price)}</td>
                      <td className="py-3.5 px-4 text-slate-500">{course.duration}</td>
                      <td className="py-3.5 px-4 font-semibold text-amber-600">{course.studentCount || 0}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${course.id}`}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900"
                            title="View Course"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: STUDENTS DIRECTORY ── */}
        {activeTab === 'Students' && <AdminStudents />}

        {/* ── TAB 4: EARNINGS & TRANSACTIONS ── */}
        {activeTab === 'Earnings' && <AdminEarnings />}

        {activeTab === 'Requests' && <AdminRequests />}
        {activeTab === 'Messages' && <AdminMessages />}

        {/* ── TAB 5, 6, 7: CERTIFICATE, QUIZZES, ASSIGNMENTS ── */}
        {activeTab === 'Courses' && <AdminCourseEditor />}

        {activeTab === 'Payments' && (
          <div className="space-y-6">
            <AdminPaymentSetup />
            <AdminPaymentsBoard />
          </div>
        )}

        {activeTab === 'Quizzes' && <AdminQuizzes />}
        {activeTab === 'Certificate' && <AdminCertificates />}
        {activeTab === 'Assignments' && <AdminAssignments />}

      </main>
    </div>
  );
}
