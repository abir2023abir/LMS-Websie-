'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import VideoPlayer from '@/components/player/VideoPlayer';
import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  Zap,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Award,
  FileText,
  MessageSquare,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<CourseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    'les-0-0': true,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (!courseId) return;

      const fetched = await getCourseById(courseId);
      if (fetched) {
        setCourse(fetched);
      } else {
        const match = featuredCourses.find((c) => c.id === courseId || c.slug === courseId);
        if (match) {
          setCourse({
            id: match.id,
            title: match.title,
            description: match.description,
            instructorId: match.instructor.name,
            instructorName: match.instructor.name,
            price: match.price,
            thumbnail: match.thumbnail,
            category: match.category,
            modules: [
              {
                id: 'mod-1',
                title: 'Module 1: Introduction & Foundations',
                lessons: [
                  { id: 'les-0-0', title: '1. Course Orientation & Learning Goals', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '05:30' },
                  { id: 'les-0-1', title: '2. Setting Up Your Development Environment', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '12:15' },
                  { id: 'les-0-2', title: '3. Core Concepts Overview', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '08:45' },
                ],
              },
              {
                id: 'mod-2',
                title: 'Module 2: Advanced Implementation',
                lessons: [
                  { id: 'les-1-0', title: '4. Deep Dive into Practical Projects', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '15:20' },
                  { id: 'les-1-1', title: '5. Best Practices & Optimization Tips', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: '11:10' },
                ],
              },
            ],
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm">Loading classroom video environment...</div>
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="font-display font-bold text-2xl mb-2">Classroom Session Unavailable</h2>
        <p className="text-slate-400 text-sm mb-6">Course content is currently being updated by the instructor.</p>
        <Link href="/dashboard/student">
          <Button variant="primary" size="md">Return to Student Dashboard</Button>
        </Link>
      </div>
    );
  }

  const currentModule = course.modules[activeModuleIndex] || course.modules[0];
  const currentLesson = currentModule?.lessons?.[activeLessonIndex] || currentModule?.lessons?.[0];

  // Compute overall course completion percentage
  let totalLessons = 0;
  let finishedCount = 0;
  course.modules.forEach((mod) => {
    mod.lessons?.forEach((les) => {
      totalLessons++;
      if (completedLessons[les.id]) finishedCount++;
    });
  });

  const completionPercent = totalLessons > 0 ? Math.round((finishedCount / totalLessons) * 100) : 0;

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const handleNextLesson = () => {
    if (currentLesson) {
      setCompletedLessons((prev) => ({ ...prev, [currentLesson.id]: true }));
    }

    if (activeLessonIndex < currentModule.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else if (activeModuleIndex < course.modules!.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonIndex(0);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    } else if (activeModuleIndex > 0) {
      setActiveModuleIndex(activeModuleIndex - 1);
      const prevModLessons = course.modules![activeModuleIndex - 1].lessons;
      setActiveLessonIndex(prevModLessons.length - 1);
    }
  };

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-dark-900 text-white flex flex-col">
        {/* ── CLASSROOM TOP BAR ── */}
        <header className="bg-dark-800 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/student"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <span className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-gradient flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-display font-bold text-sm text-white truncate max-w-md">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Header Indicator */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">
                Course Progress: <strong className="text-emerald-400">{completionPercent}%</strong>
              </span>
              <div className="w-36 bg-dark-900 h-1.5 rounded-full mt-1 overflow-hidden border border-white/5">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLessonComplete(currentLesson.id)}
              leftIcon={<CheckCircle className={`w-3.5 h-3.5 ${completedLessons[currentLesson?.id] ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />}
            >
              {completedLessons[currentLesson?.id] ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </header>

        {/* ── CLASSROOM MAIN TWO-COLUMN LAYOUT ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* LEFT COLUMN: Video Player & Controls (8 Cols on Desktop) */}
          <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Video Player Component */}
            <VideoPlayer
              videoUrl={currentLesson?.videoUrl}
              poster={course.thumbnail}
              title={currentLesson?.title || 'Lesson Video'}
              isEnrolled={true}
            />

            {/* Lesson Control & Title Bar */}
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                    {currentModule?.title}
                  </span>
                  <h2 className="font-display font-bold text-xl text-white mt-1">
                    {currentLesson?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrevLesson}
                    disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextLesson}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>

              {/* Lesson Description & Resource Tabs */}
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-4 text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Lecture Notes</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Discussion Q&A</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Certificate Eligible</span>
                </div>
                <p className="text-slate-400 leading-relaxed pt-1">
                  In this video lecture, we cover hands-on implementation details for building high performance web software. Make sure to follow along with the code samples provided in the resources section below.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Curriculum Sidebar (4 Cols on Desktop) */}
          <div className="lg:col-span-4 bg-dark-800/80 border-l border-white/10 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-white">Course Curriculum</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {finishedCount} of {totalLessons} lessons completed ({completionPercent}%)
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>

            {/* Modules Accordion List */}
            <div className="space-y-3">
              {course.modules.map((mod, mIdx) => (
                <div key={mod.id || mIdx} className="glass rounded-2xl border border-white/8 overflow-hidden">
                  <div className="p-3.5 bg-white/5 font-semibold text-xs text-white flex items-center justify-between">
                    <span>{mod.title}</span>
                    <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {mod.lessons?.length || 0} lessons
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 bg-dark-900/40">
                    {mod.lessons?.map((les, lIdx) => {
                      const isActive = mIdx === activeModuleIndex && lIdx === activeLessonIndex;
                      const isDone = !!completedLessons[les.id];

                      return (
                        <button
                          key={les.id}
                          onClick={() => {
                            setActiveModuleIndex(mIdx);
                            setActiveLessonIndex(lIdx);
                          }}
                          className={`w-full flex items-center justify-between p-3 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-primary-600/20 text-white font-semibold border-l-4 border-primary-500'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleLessonComplete(les.id);
                              }}
                              className="accent-emerald-400 rounded cursor-pointer flex-shrink-0"
                            />
                            {isActive ? (
                              <PlayCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">{les.duration || '10:00'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
