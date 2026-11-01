'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import SecureVideoPlayer from '@/components/player/SecureVideoPlayer';
import CertificateModal from '@/components/student/CertificateModal';
import {
  getCourseProgress,
  saveLessonCompletion,
  getFallbackCourseData,
  rankInCourse,
  type CourseProgressRecord,
} from '@/lib/progress';
import { getCourseById } from '@/lib/course-client';
import { useCourseEdits } from '@/lib/course-edits-client';
import LessonQuestions from '@/components/student/LessonQuestions';
import LessonQuiz from '@/components/student/LessonQuiz';
import LessonAssignment from '@/components/student/LessonAssignment';
import LessonSteps, { type LessonProgress, type LiveSession } from '@/components/student/LessonSteps';
import { lessonNote, lessonVideo, recordWatch, saveLessonNote, watchPercent } from '@/lib/workspace';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  HelpCircle,
  MessageSquare,
  Download,
  Check,
  Clock,
  Send,
  ThumbsUp,
  Volume2,
  FileCheck,
  Lock,
  ClipboardList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params?.courseId as string) || '1';
  const { user, userProfile } = useAuth();

  const [course, setCourse] = useState<CourseSchema | null>(null);
  const [progress, setProgress] = useState<CourseProgressRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [noteText, setNoteText] = useState('');
  const courseEdits = useCourseEdits();
  const [watchTick, setWatchTick] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-0': true,
  });

  // Active tab beneath the video player
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz' | 'assignment' | 'discussion' | 'resources'>('overview');

  // Strict lesson path from the server (video → quiz → assignment → exam → live/approval)
  const [path, setPath] = useState<{ lessons: LessonProgress[]; lives: LiveSession[]; rank: number | null; rankTotal: number } | null>(null);
  const [videoReported, setVideoReported] = useState<Record<string, boolean>>({});

  // Certificate Modal state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Discussion state

  // Load Course and Progress
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const userId = user?.uid || 'local_student';

      let fetchedCourse = await getCourseById(courseId);
      if (!fetchedCourse || !fetchedCourse.modules || fetchedCourse.modules.length === 0) {
        fetchedCourse = getFallbackCourseData(courseId);
      }

      setCourse(fetchedCourse);

      // Load user progress
      const userProg = await getCourseProgress(userId, courseId);
      setProgress(userProg);

      // Restore last accessed module and lesson if available
      if (fetchedCourse?.modules && userProg) {
        if (userProg.lastAccessedModuleId && userProg.lastAccessedLessonId) {
          fetchedCourse.modules.forEach((mod, mIdx) => {
            if (mod.id === userProg.lastAccessedModuleId) {
              setActiveModuleIndex(mIdx);
              setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
              (mod.lessons || []).forEach((les, lIdx) => {
                if (les.id === userProg.lastAccessedLessonId) {
                  setActiveLessonIndex(lIdx);
                }
              });
            }
          });
        }
      }

      setLoading(false);
    }

    loadData();
  }, [courseId, user]);

  const currentModule: ModuleSchema | undefined = course?.modules?.[activeModuleIndex];
  const currentLesson: LessonSchema | undefined = currentModule?.lessons?.[activeLessonIndex];

  // Flattened lesson list for easy Next / Previous Navigation
  const flattenedLessons = useMemo(() => {
    if (!course?.modules) return [];
    const list: { moduleIndex: number; lessonIndex: number; lesson: LessonSchema; moduleId: string }[] = [];
    course.modules.forEach((mod, mIdx) => {
      (mod.lessons || []).forEach((les, lIdx) => {
        list.push({
          moduleIndex: mIdx,
          lessonIndex: lIdx,
          lesson: les,
          moduleId: mod.id,
        });
      });
    });
    return list;
  }, [course]);

  useEffect(() => {
    if (currentLesson) setNoteText(lessonNote(currentLesson.id));
  }, [currentLesson?.id]);

  const lessonIsOpen = (mIdx: number, lIdx: number) => {
    void watchTick;
    const idx = flattenedLessons.findIndex((item) => item.moduleIndex === mIdx && item.lessonIndex === lIdx);
    if (path) {
      const entry = path.lessons.find((item) => item.lessonId === flattenedLessons[idx]?.lesson.id);
      return entry ? entry.state !== 'locked' : idx <= 0;
    }
    if (idx <= 0) return true;
    const prev = flattenedLessons[idx - 1];
    if (progress?.completedLessons[prev.lesson.id]) return true;
    return watchPercent(prev.lesson.id) >= 80;
  };

  const loadPath = useCallback(async (lessonId?: string) => {
    try {
      const res = await fetch(`/api/progress?courseId=${encodeURIComponent(courseId)}${lessonId ? `&lessonId=${encodeURIComponent(lessonId)}` : ''}`, { cache: 'no-store' });
      if (res.ok) setPath(await res.json());
    } catch { /* keep the local fallback */ }
  }, [courseId]);

  useEffect(() => {
    if (currentLesson?.id) void loadPath(currentLesson.id);
  }, [currentLesson?.id, loadPath]);

  // Tell the server once a lesson's video reaches 80%, then refresh the path.
  const reportWatch = (lessonId: string, percent: number) => {
    if (percent < 80 || videoReported[lessonId]) return;
    setVideoReported((prev) => ({ ...prev, [lessonId]: true }));
    fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'video', courseId, lessonId, percent }) })
      .then(() => loadPath(lessonId)).catch(() => undefined);
  };

  const currentPath = path?.lessons.find((item) => item.lessonId === currentLesson?.id);

  const currentFlatIndex = flattenedLessons.findIndex(
    (item) => item.moduleIndex === activeModuleIndex && item.lessonIndex === activeLessonIndex
  );

  const hasPrevLesson = currentFlatIndex > 0;
  const hasNextLesson = currentFlatIndex < flattenedLessons.length - 1
    && (!path || path.lessons.find((item) => item.lessonId === flattenedLessons[currentFlatIndex + 1]?.lesson.id)?.state !== 'locked');

  // Handle Mark Lesson Complete
  const handleToggleLessonComplete = async (lessonId?: string, modId?: string) => {
    const targetLessonId = lessonId || currentLesson?.id;
    const targetModuleId = modId || currentModule?.id;

    if (!targetLessonId || !targetModuleId || !course?.modules) return;

    const userId = user?.uid || 'local_student';
    const isCurrentlyDone = !!progress?.completedLessons[targetLessonId];

    const updated = await saveLessonCompletion(
      userId,
      courseId,
      targetLessonId,
      targetModuleId,
      !isCurrentlyDone,
      course.modules
    );

    setProgress(updated);

    if (updated.progressPercentage === 100 && !isCurrentlyDone) {
      setIsCertModalOpen(true);
    }
  };

  // Video Finished: Auto-advance and mark module/lesson complete
  const handleVideoEnded = async () => {
    if (!currentLesson || !currentModule || !course?.modules) return;

    const userId = user?.uid || 'local_student';

    const updated = await saveLessonCompletion(
      userId,
      courseId,
      currentLesson.id,
      currentModule.id,
      true,
      course.modules
    );

    setProgress(updated);

    if (updated.progressPercentage === 100) {
      setIsCertModalOpen(true);
    }

    if (hasNextLesson) {
      const next = flattenedLessons[currentFlatIndex + 1];
      setActiveModuleIndex(next.moduleIndex);
      setActiveLessonIndex(next.lessonIndex);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const next = flattenedLessons[currentFlatIndex + 1];
      setActiveModuleIndex(next.moduleIndex);
      setActiveLessonIndex(next.lessonIndex);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      const prev = flattenedLessons[currentFlatIndex - 1];
      setActiveModuleIndex(prev.moduleIndex);
      setActiveLessonIndex(prev.lessonIndex);
    }
  };

  const toggleModuleAccordion = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#111827] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl">
          <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-[#111827]">Preparing your classroom...</span>
        </div>
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center max-w-md space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-2xl text-[#111827]">Classroom Session Unavailable</h2>
          <p className="text-slate-500 text-xs">
            This course curriculum is currently being refreshed with new lectures.
          </p>
          <Link
            href="/student"
            className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const completionPercent = progress?.progressPercentage || 0;
  const standing = rankInCourse(courseId, user?.uid || '', completionPercent);
  const isCurrentLessonDone = !!progress?.completedLessons[currentLesson?.id || ''];

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
        {/* ── TOP CLASSROOM HEADER BAR (WHITE BACKGROUND) ── */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/student"
              className="p-2 text-slate-600 hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 max-w-md">
              <span className="hidden md:inline-block bg-[#FACC15] text-[#111827] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                {course.category || 'Course'}
              </span>
              <h1 className="font-display font-bold text-xs sm:text-sm text-[#111827] truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Right Header Progress & Certificate Trigger */}
          <div className="flex items-center gap-4">
            {/* Progress Gauge */}
            <div className="hidden lg:flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Course Progress:</span>
                <span className="text-amber-600 font-extrabold">{completionPercent}%</span>
              </div>
              <div className="w-36 bg-slate-100 h-2 rounded-full mt-1 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#FACC15] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Certificate Action Button */}
            {completionPercent === 100 ? (
              <button
                onClick={() => setIsCertModalOpen(true)}
                className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-[#FACC15]/30 animate-pulse transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Download Certificate</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Cert at 100% ({completionPercent}%)</span>
              </div>
            )}
          </div>
        </header>

        {/* ── 2-COLUMN MAIN CLASSROOM LAYOUT ── */}
        <main className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 items-start">
          {/* ═════════════════════════════════════════════════════════
              LEFT COLUMN (68% width): Video Player & Interactive Tabs
             ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">
            {/* Secure Video Player */}
            <div className="w-full">
              <SecureVideoPlayer
                videoUrl={currentLesson ? courseEdits[courseId]?.videos?.[currentLesson.id] || lessonVideo(courseId, currentLesson.id) || currentLesson.videoUrl : undefined}
                poster={course.thumbnail}
                title={currentLesson?.title || course.title}
                studentName={userProfile?.name || user?.displayName || 'Student Learner'}
                studentEmail={user?.email || 'student@example.com'}
                onEnded={handleVideoEnded}
                onProgress={(percent) => {
                  if (!currentLesson) return;
                  recordWatch(currentLesson.id, percent);
                  reportWatch(currentLesson.id, percent);
                  setWatchTick(percent);
                }}
                onNextLesson={hasNextLesson ? handleNextLesson : undefined}
                onPrevLesson={hasPrevLesson ? handlePrevLesson : undefined}
              />
            </div>

            {currentLesson && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Watched {watchPercent(currentLesson.id)}%. Watch 80% to finish this step.
                </p>
                <label className="block text-xs font-bold text-slate-500">Lesson notes</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-20"
                />
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100"
                  onClick={() => saveLessonNote(currentLesson.id, noteText)}
                >
                  Save notes
                </button>
              </div>
            )}

            {currentPath && path && (
              <LessonSteps
                courseId={courseId}
                lesson={currentPath}
                lives={path.lives}
                rank={path.rank}
                rankTotal={path.rankTotal}
                onOpenTab={(tab) => setActiveTab(tab)}
                onChanged={() => loadPath(currentLesson?.id)}
              />
            )}

            {/* ── LESSON ACTION & CONTROLS BAR ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">
                  {currentModule?.title}
                </div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#111827]">
                  {currentLesson?.title}
                </h2>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handlePrevLesson}
                  disabled={!hasPrevLesson}
                  className="flex-1 sm:flex-none p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  title="Previous Lecture"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                  onClick={() => handleToggleLessonComplete()}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrentLessonDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-[#FACC15] hover:bg-[#eab308] text-[#111827] shadow-md shadow-[#FACC15]/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCurrentLessonDone ? 'Completed ✓' : 'Mark Complete'}</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  disabled={!hasNextLesson}
                  className="flex-1 sm:flex-none p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  title="Next Lecture"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── INTERACTIVE LEARNING TABS ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-none">
                {[
                  { key: 'overview', label: 'Overview & Study Notes', icon: FileText },
                  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
                  { key: 'assignment', label: 'Assignment', icon: ClipboardList },
                  { key: 'discussion', label: 'Ask Instructor', icon: MessageSquare },
                  { key: 'resources', label: 'Resources', icon: Download },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === key
                        ? 'bg-[#FACC15] text-[#111827] shadow-sm'
                        : 'text-slate-600 hover:text-[#111827] bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW & NOTES */}
              {activeTab === 'overview' && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base text-[#111827]">
                      Lecture Core Takeaways & Drill Focus
                    </h3>
                    <p>
                      In this lecture, we deconstruct real-life conversation patterns, rhythm cadence, and natural idioms. Focus on mimicking the audio pitch contours and practicing full sentences without mental translation.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="font-bold text-[#111827] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Action Step For This Lesson:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Record yourself repeating the 3 primary situational phrases from minute 03:15.</li>
                      <li>Pay close attention to linking word endings to following vowels.</li>
                      <li>Complete the Knowledge Drill Quiz tab to test your comprehension.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: KNOWLEDGE QUIZ */}
              {activeTab === 'quiz' && currentLesson && (
                <LessonQuiz courseId={courseId} lessonId={currentLesson.id} />
              )}

              {activeTab === 'assignment' && currentLesson && (
                <LessonAssignment courseId={courseId} lessonId={currentLesson.id} />
              )}

              {/* TAB 3: DISCUSSION COMMUNITY */}
              {activeTab === 'discussion' && currentLesson && (
                <LessonQuestions
                  courseId={courseId}
                  courseTitle={course?.title || 'This course'}
                  moduleTitle={currentModule?.title || ''}
                  lessonId={currentLesson.id}
                  lessonTitle={currentLesson.title}
                  studentName={userProfile?.name || user?.displayName || 'Student'}
                  studentEmail={user?.email || ''}
                  rank={standing.rank}
                  rankTotal={standing.total}
                  progress={standing.progress}
                />
              )}

              {/* TAB 4: RESOURCES */}
              {activeTab === 'resources' && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                  No downloadable resources for this lesson yet.
                </div>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              RIGHT COLUMN (32% width): Scrollable Course Curriculum
             ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {/* Curriculum Header */}
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-base text-[#111827]">
                  Course Curriculum
                </h3>
                <span className="text-xs text-amber-600 font-extrabold">
                  {completionPercent}% Complete
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {course.modules.length} Modules • {flattenedLessons.length} Video Lectures
              </p>
            </div>

            {/* Modules Accordion List */}
            <div className="space-y-3">
              {course.modules.map((mod, mIdx) => {
                const isExpanded = expandedModules[mod.id] !== false;
                const isModCompleted = !!progress?.completedModules[mod.id];

                return (
                  <div
                    key={mod.id}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
                  >
                    {/* Module Header Accordion Toggle */}
                    <button
                      onClick={() => toggleModuleAccordion(mod.id)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {isModCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {mIdx + 1}
                          </div>
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="font-display font-bold text-xs text-[#111827] truncate">
                            {mod.title}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {mod.lessons?.length || 0} Lectures
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Lessons Drawer */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-white divide-y divide-slate-100">
                        {mod.lessons?.map((les, lIdx) => {
                          const isPlaying = activeModuleIndex === mIdx && activeLessonIndex === lIdx;
                          const isDone = !!progress?.completedLessons[les.id];
                          const isLocked = !lessonIsOpen(mIdx, lIdx);

                          return (
                            <div
                              key={les.id}
                              onClick={() => {
                                if (!lessonIsOpen(mIdx, lIdx)) return;
                                setActiveModuleIndex(mIdx);
                                setActiveLessonIndex(lIdx);
                              }}
                              className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                                isPlaying
                                  ? 'bg-amber-50 border-l-4 border-amber-500 text-[#111827] font-bold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                ) : isDone ? (
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                ) : isPlaying ? (
                                  <PlayCircle className="w-4 h-4 text-amber-500 fill-amber-500/20 flex-shrink-0 animate-pulse" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                                {les.duration || '08:00'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certificate Unlock Banner at the Bottom of Drawer */}
            <div className="pt-2 border-t border-slate-100">
              {completionPercent === 100 ? (
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#FACC15]/20 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Download Your Diploma</span>
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center space-y-1.5">
                  <div className="text-xs font-bold text-[#111827] flex items-center justify-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Completion Diploma</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Finish all {flattenedLessons.length} lectures to unlock your verified credential.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── CERTIFICATE CELEBRATION MODAL ── */}
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          courseTitle={course.title}
          studentName={userProfile?.name || user?.displayName || 'Learner'}
          certificateId={progress?.certificateId || 'EC-2026-8921'}
          completedAt={progress?.completedAt || new Date().toISOString()}
        />
      </div>
    </AuthGuard>
  );
}
