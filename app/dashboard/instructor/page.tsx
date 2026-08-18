'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Plus,
  LogOut,
  X,
  Upload,
  Video,
  Trash2,
  CheckCircle,
  AlertCircle,
  Film,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

export default function InstructorDashboard() {
  const { userProfile, user, logout } = useAuth();

  // State for Modal & Courses
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [courses, setCourses] = useState<CourseSchema[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Dynamic Modules & Lessons State
  const [modules, setModules] = useState<ModuleSchema[]>([
    {
      id: 'mod-1',
      title: 'Module 1: Introduction & Environment Setup',
      lessons: [
        {
          id: 'les-1',
          title: 'Welcome to the Course',
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

  // Fetch instructor's courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        // Filter by current instructor or return all
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

    const finalThumbnail = thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=340&fit=crop';

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
        instructorName: userProfile?.name || user?.displayName || 'Instructor',
        price: Number(price),
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
      <div className="min-h-screen bg-dark-900 flex flex-col justify-between">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full flex-1">
          {/* Welcome Header Banner */}
          <div className="glass rounded-3xl border border-white/10 p-8 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/15 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-accent-500/40">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'I'}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> Instructor Studio
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {userProfile?.name || user?.displayName || 'Instructor'}&apos;s Dashboard
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="accent"
                  size="md"
                  id="upload-course-btn"
                  onClick={() => setShowUploadModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Upload New Course
                </Button>
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

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">1,420</div>
              <div className="text-xs text-slate-400 mt-1">Total Enrolled Students</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">$4,850</div>
              <div className="text-xs text-slate-400 mt-1">Total Earnings</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">{courses.length}</div>
              <div className="text-xs text-slate-400 mt-1">Published Courses</div>
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Star className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-2xl text-white">4.9 / 5</div>
              <div className="text-xs text-slate-400 mt-1">Average Course Rating</div>
            </div>
          </div>

          {/* ── Instructor's Uploaded Courses Table ── */}
          <div className="glass rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-white">
                  Your Uploaded Courses
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your active learning modules and track student enrollment
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                New Course
              </Button>
            </div>

            {loadingCourses ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Loading your courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm glass rounded-2xl border border-white/5">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No courses published yet. Click &quot;Upload New Course&quot; to create your first course!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Course</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Price</th>
                      <th className="py-3.5 px-4 font-semibold">Lessons</th>
                      <th className="py-3.5 px-4 font-semibold">Rating</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0 border border-white/10">
                              <Image
                                src={c.thumbnail}
                                alt={c.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-white leading-snug line-clamp-1">
                                {c.title}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1">
                                {c.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="badge bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {c.category || 'Web Dev'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">
                          ${c.price}
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {c.lessonCount || 0} lessons
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-amber-400 font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{c.rating || 5.0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="glass rounded-3xl border border-white/10 w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Upload New Course</h2>
                  <p className="text-xs text-slate-400">Create & publish your course syllabus with video modules</p>
                </div>
              </div>

              {/* Success / Error Alerts */}
              {formSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmitCourse} className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Master Full-Stack Web Development with Next.js 14"
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="49"
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Skill Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Thumbnail Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4 text-accent-400" />
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
                        onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailPreview(e.target.value); }}
                        placeholder="Or paste Image URL..."
                        className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a compelling overview of what students will learn in this course..."
                      className="w-full bg-dark-800 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 resize-none"
                    />
                  </div>
                </div>

                {/* ── DYNAMIC MODULES & VIDEO LESSONS ── */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-accent-400" />
                      <h3 className="font-display font-semibold text-base text-white">
                        Course Curriculum (Modules & Video Lessons)
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addModule}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Module
                    </Button>
                  </div>

                  {modules.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-xs text-slate-500">
                      No modules added yet. Click &quot;Add Module&quot; to build your course syllabus.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {modules.map((mod, modIdx) => (
                        <div
                          key={mod.id}
                          className="glass rounded-2xl border border-white/8 p-4 bg-white/5 space-y-3"
                        >
                          {/* Module Header */}
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                              placeholder={`Module ${modIdx + 1} Title`}
                              className="font-semibold text-sm bg-dark-800 border border-white/10 rounded-lg px-3 py-1.5 text-white flex-1 focus:outline-none focus:border-accent-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeModule(mod.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Delete module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Lessons inside Module */}
                          <div className="pl-4 space-y-2 border-l-2 border-accent-500/30">
                            {mod.lessons.map((les, lesIdx) => (
                              <div
                                key={les.id}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-dark-800/80 p-3 rounded-xl border border-white/5 text-xs"
                              >
                                <Film className="w-4 h-4 text-slate-500 flex-shrink-0 hidden sm:block" />
                                <input
                                  type="text"
                                  value={les.title}
                                  onChange={(e) =>
                                    updateLesson(mod.id, les.id, 'title', e.target.value)
                                  }
                                  placeholder={`Lesson ${lesIdx + 1} Title`}
                                  className="bg-dark-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white flex-1 focus:outline-none"
                                />
                                <input
                                  type="url"
                                  value={les.videoUrl}
                                  onChange={(e) =>
                                    updateLesson(mod.id, les.id, 'videoUrl', e.target.value)
                                  }
                                  placeholder="Video URL (e.g. YouTube / Vimeo / MP4)"
                                  className="bg-dark-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white flex-1 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLesson(mod.id, les.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 self-end sm:self-auto"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addLesson(mod.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300 pt-1"
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
                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    isLoading={submitting}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Publish Course
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AuthGuard>
  );
}
