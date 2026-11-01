'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  Plus, LogOut, Shield, LayoutDashboard, BookOpen, Award, HelpCircle,
  Banknote, Users, FileText, Search, Trash2, RefreshCw, Eye,
  Sparkles, Inbox, MessageSquare, Pencil, Globe, Menu, X, GraduationCap, Video, TrendingUp
} from 'lucide-react';
import { applyCourseEdit, useCourseEdits } from '@/lib/course-edits-client';
import TopCoursesList from './TopCoursesList';
import InboxButton from '@/components/inbox/InboxButton';
import { takaFromUsd } from '@/lib/utils';

// Each tab loads its code only when opened, so the admin panel starts fast.
const TabLoading = () => <div className="h-64 animate-pulse rounded-3xl bg-white" />;
const StatsCards = dynamic(() => import('./StatsCards'), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-3xl bg-white" /> });
const RevenueAreaChart = dynamic(() => import('./RevenueAreaChart'), { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-3xl bg-white" /> });
const AdminCourseEditor = dynamic(() => import('./AdminCourseEditor'), { loading: TabLoading });
const AdminPaymentSetup = dynamic(() => import('./AdminPaymentSetup'), { loading: TabLoading });
const AdminQuizzes = dynamic(() => import('./AdminQuizzes'), { loading: TabLoading });
const AdminExams = dynamic(() => import('./AdminExams'), { loading: TabLoading });
const AdminLiveClasses = dynamic(() => import('./AdminLiveClasses'), { loading: TabLoading });
const AdminProgress = dynamic(() => import('./AdminProgress'), { loading: TabLoading });
const AdminStudents = dynamic(() => import('./AdminStudents'), { loading: TabLoading });
const AdminRequests = dynamic(() => import('./AdminRequests'), { loading: TabLoading });
const AdminAssignments = dynamic(() => import('./AdminAssignments'), { loading: TabLoading });
const AdminCertificates = dynamic(() => import('./AdminCertificates'), { loading: TabLoading });
const AdminEarnings = dynamic(() => import('./AdminEarnings'), { loading: TabLoading });
const AdminPaymentsBoard = dynamic(() => import('./AdminPaymentsBoard'), { loading: TabLoading });
const AdminMessages = dynamic(() => import('./AdminMessages'), { loading: TabLoading });
const AdminAccounts = dynamic(() => import('./AdminAccounts'), { loading: TabLoading });
const LandingPageCMS = dynamic(() => import('./LandingPageCMS'), { loading: TabLoading });

const navTabs = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Courses', icon: BookOpen },
  { name: 'Certificate', icon: Award },
  { name: 'Quizzes', icon: HelpCircle },
  { name: 'Exams', icon: GraduationCap },
  { name: 'Live Classes', icon: Video },
  { name: 'Progress', icon: TrendingUp },
  { name: 'Earnings', icon: Banknote },
  { name: 'Students', icon: Users },
  { name: 'Accounts', icon: Shield },
  { name: 'Requests', icon: Inbox },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Assignments', icon: FileText },
  { name: 'Payments', icon: Banknote },
  { name: 'Landing Page CMS', icon: Globe },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editsVersion, setEditsVersion] = useState(0);
  const courseEdits = useCourseEdits(editsVersion);

  const { data, mutate, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
  const { data: requestData } = useSWR('/api/admin/service-requests', fetcher, {
    // Only the request-count badge needs this; no need to hit the server every few seconds.
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
  const serviceRequests = requestData?.requests || [];

  const stats = data?.stats || {};
  const coursesList = (stats?.courses || []).map((c: any) => applyCourseEdit(c, courseEdits[String(c.id)]));
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 lg:flex">
      {/* ── SIDEBAR: fixed column on desktop, slide-in drawer on phones ── */}
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#111827] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-lg border border-[#FACC15] bg-black/40 px-3 py-1">
              <span className="font-display text-[10px] font-extrabold uppercase leading-none tracking-wider text-[#FACC15]">Career Bridge</span>
              <span className="mt-0.5 font-display text-[8px] font-bold uppercase leading-none tracking-widest text-white">.Studio</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin</span>
          </div>
          <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return <button key={tab.name} onClick={() => { setActiveTab(tab.name); setMenuOpen(false); }} aria-current={isActive ? 'page' : undefined} className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${isActive ? 'bg-[#FACC15] text-[#111827]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1">{tab.name}</span>
              {tab.name === 'Requests' && serviceRequests.length > 0 && <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${isActive ? 'bg-[#111827] text-[#FACC15]' : 'bg-[#FACC15] text-[#111827]'}`}>{serviceRequests.length}</span>}
            </button>;
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <Link href="/teacher" className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-3 text-sm font-extrabold text-[#111827] transition hover:bg-[#EAB308]"><Plus className="h-4 w-4 stroke-[3]" /><span>Add Course</span></Link>
          <button type="button" onClick={handleLogout} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-300">
            <LogOut className="h-4 w-4" /><span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── TOP BAR ── */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-extrabold text-slate-900">{activeTab}</h1>
          {activeTab === 'Courses' && (
            <div className="hidden w-full max-w-xs items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search courses..." className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none" />
            </div>
          )}
          <button onClick={() => mutate()} className="flex items-center gap-1.5 rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" title="Refresh data">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <InboxButton scope="all" />
        </header>

      <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 lg:px-8 lg:py-8">
        <section className="min-w-0 space-y-8">
        
        {/* ── TAB 1: OVERVIEW (REAL DATABASE METRICS) ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {isLoading && !data && <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading live dashboard data…</div>}
            {data?.stats?.dataAvailable === false && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Live analytics are unavailable. Check the database connection; demo figures are hidden.</div>}
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
                    <span>Courses by Category</span>
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
                <p className="text-xs text-slate-500">Live database inventory of all published courses.</p>
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
                            onClick={() => setEditingCourse(String(course.id))}
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-slate-900"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
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
        {activeTab === 'Accounts' && <AdminAccounts />}

        {/* ── TAB 4: EARNINGS & TRANSACTIONS ── */}
        {activeTab === 'Earnings' && <AdminEarnings />}

        {activeTab === 'Requests' && <AdminRequests />}
        {activeTab === 'Messages' && <AdminMessages />}

        {/* ── TAB 5, 6, 7: CERTIFICATE, QUIZZES, ASSIGNMENTS ── */}
        {editingCourse && (
          <AdminCourseEditor
            courseId={editingCourse}
            onClose={() => setEditingCourse(null)}
            onSaved={() => setEditsVersion((v) => v + 1)}
          />
        )}

        {activeTab === 'Payments' && (
          <div className="space-y-6">
            <AdminPaymentSetup />
            <AdminPaymentsBoard key="payments-board" />
          </div>
        )}

        {activeTab === 'Quizzes' && <AdminQuizzes />}
        {activeTab === 'Exams' && <AdminExams />}
        {activeTab === 'Live Classes' && <AdminLiveClasses />}
        {activeTab === 'Progress' && <AdminProgress />}
        {activeTab === 'Certificate' && <AdminCertificates />}
        {activeTab === 'Assignments' && <AdminAssignments />}
        {activeTab === 'Landing Page CMS' && <LandingPageCMS />}

        </section>
      </main>
      </div>
    </div>
  );
}
