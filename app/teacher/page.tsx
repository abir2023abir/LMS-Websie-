'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import InboxButton from '@/components/inbox/InboxButton';
import AdminMessages from '@/components/admin/AdminMessages';
import { takaFromUsd, usdToBdt, USD_TO_BDT } from '@/lib/utils';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  BookOpen,
  Users,
  Banknote,
  Star,
  Plus,
  LogOut,
  X,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Film,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export default function TeacherPanelPage() {
  const { userProfile, user, logout } = useAuth();

  // State for Modal & Courses
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [courses, setCourses] = useState<CourseSchema[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(String(usdToBdt(49)));
  const [category, setCategory] = useState('General English');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Dynamic Modules & Lessons State
  const [modules, setModules] = useState<ModuleSchema[]>([
    {
      id: 'mod-1',
      title: 'Module 1: Foundations of Spoken Fluency',
      lessons: [
        {
          id: 'les-1',
          title: 'Welcome to English Capsules',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '05:30',
        },
      ],
    },
  ]);

  // Form Submission status
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch teacher's courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle Thumbnail File Upload Mock Preview
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setThumbnailUrl(objectUrl);
    }
  };

  // Dynamic Module Management
  const addModule = () => {
    const newModuleId = `mod-${Date.now()}`;
    setModules([
      ...modules,
      {
        id: newModuleId,
        title: `Module ${modules.length + 1}: New Topic`,
        lessons: [],
      },
    ]);
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const updateModuleTitle = (moduleId: string, newTitle: string) => {
    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, title: newTitle } : m))
    );
  };

  // Dynamic Lesson Management
  const addLesson = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          const newLessonId = `les-${Date.now()}`;
          return {
            ...m,
            lessons: [
              ...m.lessons,
              {
                id: newLessonId,
                title: `Lesson ${m.lessons.length + 1}: Video Lecture`,
                videoUrl: '',
                duration: '10:00',
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return m;
      })
    );
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    field: keyof LessonSchema,
    value: string
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, [field]: value } : l
            ),
          };
        }
        return m;
      })
    );
  };

  // Form Submit Handler -> POST /api/courses
  const handleSubmitCourse = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const finalThumbnail =
      thumbnailUrl.trim() ||
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop';

    if (!title.trim()) {
      setFormError('Please enter a course title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a course description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        instructorId: user?.uid || 'instructor-demo',
        instructorName: userProfile?.name || user?.displayName || 'Teacher',
        price: Math.round(Number(price) / USD_TO_BDT) || 0,
        thumbnail: finalThumbnail,
        category,
        level,
        modules,
      };

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create course');
      }

      setFormSuccess('Course uploaded successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('49');
      setThumbnailUrl('');
      setThumbnailPreview(null);
      setModules([]);

      // Refresh course list
      await fetchCourses();

      setTimeout(() => {
        setShowUploadModal(false);
        setFormSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Course upload error:', err);
      setFormError(err.message || 'Something went wrong while creating course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard allowedRole="Instructor">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
        <FloatingNavbar />

        {/* ── TEACHER PANEL HERO HEADER ── */}
        <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-14 px-4 sm:px-6 lg:px-8 text-[#111827]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#111827] text-[#FACC15] flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-xl shadow-black/20 flex-shrink-0">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111827] text-white text-xs font-bold shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-[#FACC15]" /> Teacher Panel
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
                  Welcome, {userProfile?.name || user?.displayName || 'Teacher'}!
                </h1>
                <p className="text-xs sm:text-sm text-[#111827]/80 font-medium">
                  {user?.email || 'Manage your English Capsules, modules & students'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <InboxButton scope="student" />
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#111827] hover:bg-black text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full transition-all shadow-lg shadow-black/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#FACC15]" />
                <span>Upload New Course</span>
              </button>
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

        {/* ── MAIN PANEL CONTENT ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-10">
          <AdminMessages
            listUrl="/api/messages?board=1"
            replyUrl="/api/messages"
            replyBody={(id, text) => ({ action: 'reply', id, text })}
            title="Course messages"
            intro="Messages sent from inside a course show the course name and the student’s rank by progress. Customer care and the admin panel see the same thread."
          />
          {/* ── QUICK METRICS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Students</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">1,420</div>
              <div className="text-xs text-slate-500">Total Enrolled Learners</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Earnings</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">{takaFromUsd(4850)}</div>
              <div className="text-xs text-slate-500">Total Revenue</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Courses</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">
                {courses.length}
              </div>
              <div className="text-xs text-slate-500">Published English Capsules</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-violet-500" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase">Rating</span>
              </div>
              <div className="font-display font-extrabold text-3xl text-[#111827]">4.9 / 5</div>
              <div className="text-xs text-slate-500">Average Course Rating</div>
            </div>
          </div>

          <DashboardCalendar />

          {/* ── UPLOADED COURSES TABLE ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-[#111827]">
                  Your Uploaded Courses
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your English Capsules and track student enrollment
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-md shadow-[#FACC15]/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Course</span>
              </button>
            </div>

            {loadingCourses ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Loading your courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>
                  No courses published yet. Click &quot;Upload New Course&quot; to create your
                  first English Capsule!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Course</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Price</th>
                      <th className="py-3.5 px-4 font-bold">Lessons</th>
                      <th className="py-3.5 px-4 font-bold">Rating</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                              <Image
                                src={
                                  c.thumbnail ||
                                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop'
                                }
                                alt={c.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-[#111827] leading-snug line-clamp-1">
                                {c.title}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1">
                                {c.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            {c.category || 'General English'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-[#111827]">{takaFromUsd(c.price)}</td>
                        <td className="py-4 px-4 text-slate-500">
                          {c.lessonCount || 0} lessons
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{c.rating || 5.0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ── UPLOAD COURSE MODAL ── */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#111827]">
                    Upload New Course
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create &amp; publish your English Capsule syllabus with video modules
                  </p>
                </div>
              </div>

              {/* Success / Error Alerts */}
              {formSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmitCourse} className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Spoken English & Accent Perfection Masterclass"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
                    >
                      <option value="Spoken English">Spoken English</option>
                      <option value="General English">General English</option>
                      <option value="IELTS Prep">IELTS Prep</option>
                      <option value="Business English">Business English</option>
                      <option value="Grammar & Writing">Grammar &amp; Writing</option>
                      <option value="Career English">Career English</option>
                      <option value="Kids English">Kids English</option>
                      <option value="TOEFL & Exams">TOEFL &amp; Exams</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Price (টাকা) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="5880"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Skill Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Thumbnail Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => {
                          setThumbnailUrl(e.target.value);
                          setThumbnailPreview(e.target.value);
                        }}
                        placeholder="Or paste Image URL..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors"
                      />
                    </div>
                    {thumbnailPreview && (
                      <div className="relative w-32 h-20 mt-3 rounded-xl overflow-hidden border border-slate-200">
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a compelling overview of what students will learn in this course..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* ── DYNAMIC MODULES & VIDEO LESSONS ── */}
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <h3 className="font-display font-semibold text-base text-[#111827]">
                        Course Curriculum (Modules &amp; Video Lessons)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={addModule}
                      className="bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                  </div>

                  {modules.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-500">
                      No modules added yet. Click &quot;Add Module&quot; to build your course
                      syllabus.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {modules.map((mod, modIdx) => (
                        <div
                          key={mod.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                        >
                          {/* Module Header */}
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                              placeholder={`Module ${modIdx + 1} Title`}
                              className="font-bold text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[#111827] flex-1 focus:outline-none focus:border-[#111827]"
                            />
                            <button
                              type="button"
                              onClick={() => removeModule(mod.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Delete module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Lessons inside Module */}
                          <div className="pl-4 space-y-2 border-l-2 border-[#FACC15]">
                            {mod.lessons.map((les, lesIdx) => (
                              <div
                                key={les.id}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs"
                              >
                                <Film className="w-4 h-4 text-slate-400 flex-shrink-0 hidden sm:block" />
                                <input
                                  type="text"
                                  value={les.title}
                                  onChange={(e) =>
                                    updateLesson(mod.id, les.id, 'title', e.target.value)
                                  }
                                  placeholder={`Lesson ${lesIdx + 1} Title`}
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#111827] flex-1 focus:outline-none focus:border-[#111827]"
                                />
                                <input
                                  type="url"
                                  value={les.videoUrl}
                                  onChange={(e) =>
                                    updateLesson(mod.id, les.id, 'videoUrl', e.target.value)
                                  }
                                  placeholder="Video URL (e.g. YouTube / Vimeo / MP4)"
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[#111827] flex-1 focus:outline-none focus:border-[#111827]"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLesson(mod.id, les.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 self-end sm:self-auto"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addLesson(mod.id)}
                              className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 pt-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Video Lesson
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#FACC15]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Publish Course</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <EnglishFooter />
      </div>
    </AuthGuard>
  );
}
