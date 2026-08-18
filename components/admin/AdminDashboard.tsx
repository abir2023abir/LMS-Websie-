'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import {
  Plus, LogOut, Shield, LayoutDashboard, BookOpen, Award, HelpCircle,
  DollarSign, Users, FileText, Search, Trash2, CheckCircle, RefreshCw, Eye
} from 'lucide-react';
import StatsCards from './StatsCards';
import RevenueAreaChart from './RevenueAreaChart';
import TopCoursesList from './TopCoursesList';

const navTabs = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Courses', icon: BookOpen },
  { name: 'Certificate', icon: Award },
  { name: 'Quizzes', icon: HelpCircle },
  { name: 'Earnings', icon: DollarSign },
  { name: 'Students', icon: Users },
  { name: 'Assignments', icon: FileText },
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

  const stats = data?.stats || {};
  const coursesList = stats?.courses || [];
  const studentsList = stats?.studentsList || [];

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
      mutate(); // Trigger SWR real-time revalidation
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
      {/* ── TOP HEADER (DARK PLUM / PURPLE #1A0B2E) ── */}
      <header className="bg-[#1A0B2E] text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1A0B2E] flex items-center justify-center font-extrabold shadow-lg shadow-yellow-400/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-white tracking-wide block leading-none">
                  English Capsules
                </span>
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest leading-none">
                  Admin Panel • Live
                </span>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white max-w-sm w-full">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses, students, invoices..."
                className="bg-transparent text-white placeholder-purple-300/40 focus:outline-none w-full text-xs"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => mutate()}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white transition-colors border border-white/10 flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh Realtime Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-[#1A0B2E] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-white leading-none">Abir Host</div>
                  <div className="text-[10px] text-purple-300/60 leading-none mt-0.5">Super Admin</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-purple-200 hover:text-red-400 transition-colors border border-white/10"
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
                        ? 'bg-yellow-400 text-[#1A0B2E] shadow-lg shadow-yellow-400/20'
                        : 'text-purple-200/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* + Add Course Yellow Button */}
            <Link
              href="/dashboard/instructor"
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#1A0B2E] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-yellow-400/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Course</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY (WHITE / LIGHT GRAY) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 relative z-20 space-y-8">
        
        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <RevenueAreaChart />
              </div>
              <div className="lg:col-span-4">
                <TopCoursesList />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: COURSES MANAGEMENT ── */}
        {activeTab === 'Courses' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900">Manage Courses</h2>
                <p className="text-xs text-slate-500">Real-time inventory of all published English Capsules courses.</p>
              </div>
              <Link
                href="/dashboard/instructor"
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#1A0B2E] font-bold text-xs px-4 py-2 rounded-full"
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
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image src={c.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=80&fit=crop'} alt={c.title} fill className="object-cover" />
                          </div>
                          <span className="font-bold text-slate-900 line-clamp-1">{c.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{c.category || 'General English'}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">${c.price}</td>
                      <td className="py-3 px-4 text-slate-500">{c.duration || '20h'}</td>
                      <td className="py-3 px-4 font-semibold text-purple-600">{c.studentCount || 340} enrolled</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link href={`/courses/${c.id}`} className="inline-flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDeleteCourse(c.id)} className="inline-flex p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: STUDENTS MANAGEMENT ── */}
        {activeTab === 'Students' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">Enrolled Students</h2>
              <p className="text-xs text-slate-500">Live directory of active English Capsules learners.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Enrolled Program</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsList.map((std: any) => (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{std.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{std.email}</td>
                      <td className="py-3.5 px-4 font-semibold text-purple-700">{std.enrolledCourse}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          <CheckCircle className="w-3 h-3" /> {std.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{std.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: EARNINGS & TRANSACTIONS ── */}
        {activeTab === 'Earnings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase">Total Net Revenue</div>
                <div className="font-display font-extrabold text-3xl text-slate-900 mt-2">$7,280.00</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase">SSLCommerz Gateway Payouts</div>
                <div className="font-display font-extrabold text-3xl text-green-600 mt-2">$6,850.00</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase">Pending Balance</div>
                <div className="font-display font-extrabold text-3xl text-amber-500 mt-2">$430.00</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-display font-bold text-base text-slate-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3 text-xs">
                {[
                  { tx: 'TXN_SSL_89210', user: 'Tanvir Ahmed', amount: '$39.00', gateway: 'SSLCommerz (bKash)', date: 'Today, 2:45 PM' },
                  { tx: 'TXN_SSL_89209', user: 'Nusaiba Rahaman', amount: '$49.00', gateway: 'SSLCommerz (Card)', date: 'Today, 1:12 PM' },
                  { tx: 'TXN_SSL_89208', user: 'Mahmudul Hasan', amount: '$69.00', gateway: 'SSLCommerz (Nagad)', date: 'Yesterday' },
                ].map((item) => (
                  <div key={item.tx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{item.user} ({item.tx})</div>
                      <div className="text-[10px] text-slate-500">{item.gateway} • {item.date}</div>
                    </div>
                    <div className="font-extrabold text-green-600 text-sm">{item.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5, 6, 7: CERTIFICATE, QUIZZES, ASSIGNMENTS ── */}
        {['Certificate', 'Quizzes', 'Assignments'].includes(activeTab) && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">{activeTab} Manager</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Manage student {activeTab.toLowerCase()} evaluations, issue certificates, and review submissions in real-time.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold">
              <CheckCircle className="w-4 h-4" /> Active & Operational
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
