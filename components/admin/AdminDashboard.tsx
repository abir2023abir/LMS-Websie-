'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  Plus, LogOut, Shield, LayoutDashboard, BookOpen, Award, HelpCircle,
  Banknote, Users, FileText, Search, Trash2, RefreshCw, Eye,
  Sparkles, Inbox, MessageSquare, Pencil, Globe, Menu, X, GraduationCap, Video, TrendingUp, AlertTriangle,
  CalendarDays, CalendarClock, BarChart3, Newspaper, Settings
} from 'lucide-react';
import { applyCourseEdit, useCourseEdits } from '@/lib/course-edits-client';
import TopCoursesList from './TopCoursesList';
import OverviewWelcome from './OverviewWelcome';
import InboxButton from '@/components/inbox/InboxButton';
import MyPhoto from '@/components/admin/MyPhoto';
import DemoCoursesButtons from '@/components/admin/DemoCoursesButtons';
import { takaFromUsd } from '@/lib/utils';
import BrandLogo from '@/components/brand/BrandLogo';

// Each tab loads its code only when opened, so the admin panel starts fast.
const TabLoading = () => <div className="h-64 animate-pulse rounded-3xl bg-white" />;
const StatsCards = dynamic(() => import('./StatsCards'), { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-3xl bg-white" /> });
const RevenueAreaChart = dynamic(() => import('./RevenueAreaChart'), { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-3xl bg-white" /> });
const CourseWorkspace = dynamic(() => import('./CourseWorkspace'), { loading: () => null });
const OverviewFeed = dynamic(() => import('./OverviewFeed'), { loading: () => null });
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
const CourseUploadModal = dynamic(() => import('./CourseUploadModal'), { loading: () => null });
const AdminAccounts = dynamic(() => import('./AdminAccounts'), { loading: TabLoading });
const LandingPageCMS = dynamic(() => import('./LandingPageCMS'), { loading: TabLoading });
const InstructorAccess = dynamic(() => import('./InstructorAccess'), { loading: TabLoading });
const AdminSchedule = dynamic(() => import('./AdminSchedule'), { loading: TabLoading });
const CmsSectionPage = dynamic(() => import('./LandingPageCMS').then((mod) => mod.CmsSectionPage), { loading: TabLoading });

// The menu is exactly the client's admin layout. Students live inside Accounts and the website
// content editor inside Settings; quizzes, exams, live classes and assignments inside each course.
const SETTINGS_TAB = 'Settings (Role & Permissions)';
const navTabs = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Courses', icon: BookOpen },
  { name: 'Program', icon: CalendarDays },
  { name: 'Bookkeeping', icon: BarChart3 },
  { name: 'Blog', icon: Newspaper },
  { name: 'Certificate', icon: Award },
  { name: 'Earnings', icon: Banknote },
  { name: 'Accounts', icon: Shield },
  { name: 'Requests', icon: Inbox },
  { name: 'Schedule', icon: CalendarClock },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Payments', icon: Banknote },
  { name: 'Progress', icon: TrendingUp },
  { name: SETTINGS_TAB, icon: Settings },
  { name: 'Quizzes', icon: HelpCircle },
  { name: 'Exams', icon: GraduationCap },
  { name: 'Live Classes', icon: Video },
  { name: 'Assignments', icon: FileText },
];

// Website pages the Landing Page CMS permission covers; an instructor with that permission sees them too.
const CMS_TABS = ['Program', 'Bookkeeping', 'Blog'];
// Admin only: these read data across every course and account.
const ADMIN_ONLY_TABS = ['Schedule'];

// These are worked on inside each course (Courses → Manage), so they get no menu entry of their own
// for anyone who can open the Courses tab.
const IN_COURSE_TABS = ['Quizzes', 'Exams', 'Assignments', 'Live Classes'];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/** Two or more pages under one menu entry (Accounts → Students, Settings → Website content). */
function SubTabs({ items }: { items: { name: string; show: boolean; view: React.ReactNode }[] }) {
  const shown = items.filter((item) => item.show);
  const [current, setCurrent] = useState(shown[0]?.name || '');
  const active = shown.find((item) => item.name === current) || shown[0];
  if (!active) return null;
  return (
    <div className="space-y-5">
      {shown.length > 1 && (
        <div role="tablist" className="flex flex-wrap gap-2">
          {shown.map((item) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={item.name === active.name}
              onClick={() => setCurrent(item.name)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${item.name === active.name ? 'bg-[#111827] text-[#FACC15]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      {active.view}
    </div>
  );
}

export default function AdminDashboard({
  variant = 'admin',
  allowedTabs,
}: {
  variant?: 'admin' | 'instructor';
  allowedTabs?: string[];
}) {
  const [activeTab, setActiveTab] = useState(variant === 'instructor' ? (allowedTabs?.[0] || 'Overview') : 'Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  // Set while the workspace is open for a course that was created a moment ago.
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [editsVersion, setEditsVersion] = useState(0);
  const courseEdits = useCourseEdits(editsVersion);

  const { data, mutate, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: activeTab === 'Overview' ? 15000 : 0,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
    isPaused: () => activeTab !== 'Overview',
  });
  // Warns when Supabase is not set up, so nobody thinks unsaved data was kept.
  const { data: storage } = useSWR('/api/admin/storage-status', fetcher, { revalidateOnFocus: false });
  const { data: requestData } = useSWR('/api/admin/service-requests', fetcher, {
    // Only the request-count badge needs this; no need to hit the server every few seconds.
    refreshInterval: 30000,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
  const serviceRequests = requestData?.requests || [];
  const hasCoursesTab = variant === 'admin' || (allowedTabs || []).includes('Courses');
  const visibleTabs = navTabs.filter((tab) => {
    if (hasCoursesTab && IN_COURSE_TABS.includes(tab.name)) return false;
    if (variant === 'admin') return true;
    if (ADMIN_ONLY_TABS.includes(tab.name)) return false;
    const allowed = allowedTabs || [];
    if (CMS_TABS.includes(tab.name)) return allowed.includes('Landing Page CMS');
    if (tab.name === 'Accounts') return allowed.includes('Accounts') || allowed.includes('Students');
    if (tab.name === SETTINGS_TAB) return allowed.includes('Landing Page CMS');
    return (allowedTabs || []).includes(tab.name);
  });

  useEffect(() => {
    if (variant === 'instructor' && allowedTabs && !visibleTabs.some((tab) => tab.name === activeTab)) {
      setActiveTab(visibleTabs[0]?.name || '');
    }
  }, [activeTab, allowedTabs, variant]);

  const stats = data?.stats || {};
  const coursesList = (stats?.courses || []).map((c: any) => applyCourseEdit(c, courseEdits[String(c.id)]));
  const categoryDistribution = stats?.categoryDistribution || [];

  const handleLogout = async () => {
    try {
      await fetch(variant === 'instructor' ? '/api/auth/logout' : '/api/admin/logout', { method: 'POST', cache: 'no-store' });
    } finally {
      window.location.replace(variant === 'instructor' ? '/instructor' : '/admin');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`/api/courses/${encodeURIComponent(courseId)}`, { method: 'DELETE' });
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
    <div className="min-h-screen bg-[#f6f3ec] font-sans text-slate-900 lg:flex">
      {menuOpen && <div className="fixed inset-0 z-40 bg-[#0b1220]/60 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] shrink-0 flex-col bg-[#0c1222] text-white shadow-black/30 transition-transform duration-200 lg:shadow-2xl lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="border-b border-white/10 bg-gradient-to-br from-[#172033] to-[#0c1222] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <BrandLogo className="h-12 w-auto" />
              <p className="mt-3 font-display text-sm font-extrabold tracking-tight text-white">{variant === 'instructor' ? 'Instructor' : 'Super Admin'}</p>
              <p className="text-[11px] font-medium text-slate-400">{variant === 'instructor' ? 'Your teaching tools' : 'Studio control room'}</p>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return <button key={tab.name} onClick={() => { setActiveTab(tab.name); setMenuOpen(false); if (tab.name === 'Overview') void mutate(); }} aria-current={isActive ? 'page' : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${isActive ? 'bg-white text-[#111827] shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-[#FACC15] text-[#111827]' : 'bg-white/10 text-slate-300'}`}><Icon className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">{tab.name}</span>
              {tab.name === 'Requests' && serviceRequests.length > 0 && <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${isActive ? 'bg-[#111827] text-[#FACC15]' : 'bg-[#FACC15] text-[#111827]'}`}>{serviceRequests.length}</span>}
            </button>;
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/15 hover:text-red-200">
            <LogOut className="h-4 w-4" /><span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#111827]/10 bg-[#fffdf8]/90 px-4 py-3 shadow-sm shadow-slate-900/5 backdrop-blur sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">{variant === 'instructor' ? 'Instructor panel' : 'Super admin'}</p>
            <h1 key={activeTab} className="truncate font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{activeTab}</h1>
          </div>
          {activeTab === 'Courses' && (
            <div className="hidden w-full max-w-xs items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search courses…" className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none" />
            </div>
          )}
          <button onClick={() => mutate()} className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" title="Refresh data">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {variant === 'admin' && (
            // Opens the student panel as the demo student: every course open, nothing counted.
            <a href="/api/admin/demo-student" target="_blank" rel="noopener" className="flex min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-3 py-2 text-xs font-bold text-[#FACC15] transition-colors hover:bg-[#1f2937]" title="See the site as a student enrolled in every course">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View as Demo Student</span>
            </a>
          )}
          <InboxButton scope="all" />
          {variant === 'instructor' && <MyPhoto />}
        </header>

      <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-5 lg:px-8 lg:py-8">
        <section className="min-w-0 space-y-8">
        {storage && storage.ok === false && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Database is not set up — new data is not being saved.</p>
              <p className="mt-1">{storage.message} Open Supabase → SQL Editor, paste the contents of <code className="rounded bg-red-100 px-1">supabase/app_kv.sql</code> and press Run. This warning disappears once it works.</p>
            </div>
          </div>
        )}

        {/* ── TAB 1: OVERVIEW (REAL DATABASE METRICS) ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {isLoading && !data && <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading live dashboard data…</div>}
            {data?.stats?.dataAvailable === false && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Live analytics are unavailable. Check the database connection; demo figures are hidden.</div>}
            <OverviewWelcome name={data?.viewerName || ''} title={variant === 'instructor' ? 'Instructor · Your teaching tools' : 'Super Admin · Studio control room'} />

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

            {/* Real-time Category Distribution from Database (always shown: part of the client layout) */}
            {(
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

                {categoryDistribution.length === 0 && <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No courses yet. Add one under Courses.</div>}
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

            {/* Schedule, notifications, device alerts and new enrollments (admin only) */}
            {variant === 'admin' && <OverviewFeed onOpenTab={setActiveTab} />}
          </div>
        )}

        {/* ── TAB 2: COURSES MANAGEMENT ── */}
        {activeTab === 'Courses' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-6 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display font-extrabold text-xl text-slate-900">Manage Courses ({filteredCourses.length})</h2>
                <p className="text-xs text-slate-500">Press Manage on a course to work on its lessons, mentor, timeline, quizzes, assignments, exams and live classes in one place.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {variant === 'admin' && <DemoCoursesButtons onChanged={() => { void mutate(); }} />}
                <button
                  type="button"
                  onClick={() => setAddingCourse(true)}
                  className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-bold text-xs px-4 py-2 rounded-full"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Course</span>
                </button>
              </div>
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
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800"
                            title="Open course workspace"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Manage</span>
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
        {activeTab === 'Accounts' && (
          <SubTabs
            items={[
              { name: 'Accounts', show: variant === 'admin' || (allowedTabs || []).includes('Accounts'), view: <AdminAccounts /> },
              { name: 'Students', show: variant === 'admin' || (allowedTabs || []).includes('Students'), view: <AdminStudents /> },
            ]}
          />
        )}

        {/* ── TAB 4: EARNINGS & TRANSACTIONS ── */}
        {activeTab === 'Earnings' && <AdminEarnings />}

        {activeTab === 'Requests' && <AdminRequests />}
        {activeTab === 'Messages' && (
          <AdminMessages
            listUrl={variant === 'instructor' ? '/api/messages?board=1' : '/api/admin/messages'}
            replyUrl={variant === 'instructor' ? '/api/messages' : '/api/admin/messages'}
            replyBody={variant === 'instructor' ? (id, text) => ({ action: 'reply', id, text }) : undefined}
            title="Course messages"
            intro="Student lesson questions land here for you and for the instructor on that course."
          />
        )}
        {addingCourse && (
          <CourseUploadModal
            asAdmin={variant === 'admin'}
            onClose={() => setAddingCourse(false)}
            onCreated={(courseId) => { void mutate(); setJustCreated(courseId); setEditingCourse(courseId); }}
          />
        )}

        {/* ── TAB 5, 6, 7: CERTIFICATE, QUIZZES, ASSIGNMENTS ── */}
        {editingCourse && (() => {
          const row = coursesList.find((item: any) => String(item.id) === editingCourse);
          return (
            <CourseWorkspace
              key={editingCourse}
              courseId={editingCourse}
              title={row?.title || 'New course'}
              thumbnail={row?.thumbnail}
              category={row?.category}
              isAdmin={variant === 'admin'}
              allowedTabs={allowedTabs}
              isNew={justCreated === editingCourse}
              onClose={() => { setEditingCourse(null); setJustCreated(null); }}
              onSaved={() => { setEditsVersion((v) => v + 1); void mutate(); }}
            />
          );
        })()}

        {activeTab === 'Payments' && (
          <div className="space-y-6">
            {/* Payment gateway settings are admin only; instructors with Payments see the board. */}
            {variant === 'admin' && <AdminPaymentSetup />}
            <AdminPaymentsBoard key="payments-board" />
          </div>
        )}

        {activeTab === 'Quizzes' && <AdminQuizzes />}
        {activeTab === 'Exams' && <AdminExams />}
        {activeTab === 'Live Classes' && <AdminLiveClasses />}
        {activeTab === 'Progress' && <AdminProgress />}
        {activeTab === 'Certificate' && <AdminCertificates />}
        {activeTab === 'Assignments' && <AdminAssignments />}
        {activeTab === SETTINGS_TAB && (
          <SubTabs
            items={[
              { name: 'Role & Permissions', show: variant === 'admin', view: <InstructorAccess /> },
              { name: 'Website content', show: variant === 'admin' || (allowedTabs || []).includes('Landing Page CMS'), view: <LandingPageCMS /> },
            ]}
          />
        )}
        {activeTab === 'Schedule' && variant === 'admin' && <AdminSchedule />}
        {activeTab === 'Program' && <CmsSectionPage section="program" />}
        {activeTab === 'Bookkeeping' && <CmsSectionPage section="bookkeeping" />}
        {activeTab === 'Blog' && <CmsSectionPage section="blog" />}
        {variant === 'instructor' && visibleTabs.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            No tools are open on this instructor account yet. An admin can turn them on under Settings (Role &amp; Permissions).
          </div>
        )}

        </section>
      </main>
      </div>
    </div>
  );
}
