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
  applyServerPath,
  getFallbackCourseData,
  rankInCourse,
  type CourseProgressRecord,
} from '@/lib/progress';
import { getCourseById } from '@/lib/course-client';
import { applyCourseEdit, loadCourseEdits, useCourseEdits } from '@/lib/course-edits-client';
import { lessonWindowLabel } from '@/lib/lesson-schedule';
import LessonQuestions from '@/components/student/LessonQuestions';
import LessonQuiz from '@/components/student/LessonQuiz';
import LessonAssignment from '@/components/student/LessonAssignment';
import LessonSteps, { type CourseTimeline, type LessonProgress, type LiveSession } from '@/components/student/LessonSteps';
import CourseReviewForm from '@/components/student/CourseReviewForm';
import { useLearningPrefs } from '@/components/student/LearningSettings';
import LessonExams from '@/components/student/LessonExams';
import CampusMessageForm from '@/components/messages/CampusMessageForm';
import MyMessages from '@/components/student/MyMessages';
import ShortVideoList from '@/components/course/ShortVideoList';
import QuestionList from '@/components/course/QuestionList';
import DiscussionBoard from '@/components/course/DiscussionBoard';
import { useCommunity } from '@/components/course/useCommunity';
import { lessonNote, lessonVideo, recordWatch, saveLessonNote, watchPercent } from '@/lib/workspace';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  Layers,
  Star,
  Mail,
  Settings,
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
  // Client layout: classroom tabs under the video (Overview, Modules, Classroom, Message), and the
  // lesson's own tabs further down (Overview & Study Notes, Video, Quiz, Assignment, Ask Instructor, Exams, Resources).
  type TopTab = 'overview' | 'modules' | 'classroom' | 'message';
  type ClassTab = 'overview' | 'video' | 'quiz' | 'assignment' | 'ask-instructor' | 'exams' | 'resources';
  const [topTab, setTopTab] = useState<TopTab>('overview');
  const [activeTab, setActiveTab] = useState<ClassTab>('overview');
  const community = useCommunity(courseId);
  const [sentCount, setSentCount] = useState(0);
  // Lessons whose video the student started (until then the cover picture shows).
  const [started, setStarted] = useState<Record<string, boolean>>({});
  const [noteSaved, setNoteSaved] = useState(false);
  const [prefs, setPrefs] = useLearningPrefs();
  // The lesson path's buttons open the tab that holds that part.
  const openPart = (part: 'overview' | 'quiz' | 'assignment' | 'resources') => {
    setActiveTab(part === 'quiz' ? 'quiz' : part === 'assignment' ? 'assignment' : part === 'resources' ? 'resources' : 'overview');
    document.getElementById('classroom-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Lesson path from the server: overview + video → quiz → notes + assignment → exam. Live classes stay open.
  const [path, setPath] = useState<{ lessons: LessonProgress[]; lives: LiveSession[]; timeline?: CourseTimeline; notices?: { id: string; kind: string; text: string; by: string }[]; examsPaused?: boolean; rank: number | null; rankTotal: number } | null>(null);
  const [partBusy, setPartBusy] = useState(false);
  const [videoReported, setVideoReported] = useState<Record<string, boolean>>({});
  // Which of the lesson's videos is playing (video 1 is 'main').
  const [videoChoice, setVideoChoice] = useState<Record<string, string>>({});

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
      const edits = await loadCourseEdits();
      if (fetchedCourse) fetchedCourse = applyCourseEdit(fetchedCourse, edits[String(courseId)]);

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
    setNoteSaved(false);
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
  // Video 1 is tracked as the lesson id, video 2, 3, … as "lessonId#videoId".
  const watchKey = (lessonId: string, videoId: string) => (videoId === 'main' ? lessonId : `${lessonId}#${videoId}`);
  const reportWatch = (lessonId: string, percent: number, videoId = 'main') => {
    const key = watchKey(lessonId, videoId);
    if (percent < 80 || videoReported[key]) return;
    setVideoReported((prev) => ({ ...prev, [key]: true }));
    fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'video', courseId, lessonId, percent, videoId }) })
      .then(() => loadPath(lessonId)).catch(() => undefined);
  };

  const currentPath = path?.lessons.find((item) => item.lessonId === currentLesson?.id);

  // The student confirms the overview or the notes were read (opening the tab alone does not count).
  const markPart = async (part: 'overview' | 'notes') => {
    if (!currentLesson) return;
    setPartBusy(true);
    try {
      await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'part', part, courseId, lessonId: currentLesson.id }) });
      await loadPath(currentLesson.id);
    } finally { setPartBusy(false); }
  };
  const partButton = (part: 'overview' | 'notes') => {
    const step = currentPath?.steps.find((item) => item.key === part);
    if (!step) return null;
    if (step.state === 'done') return <p className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">Marked as read ✓</p>;
    if (step.state === 'locked') return <p className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">{step.detail}</p>;
    return <button type="button" disabled={partBusy} onClick={() => markPart(part)} className="rounded-xl bg-[#FACC15] px-4 py-2 text-xs font-extrabold text-[#111827] disabled:opacity-50">I have read this</button>;
  };

  const currentFlatIndex = flattenedLessons.findIndex(
    (item) => item.moduleIndex === activeModuleIndex && item.lessonIndex === activeLessonIndex
  );

  const hasPrevLesson = currentFlatIndex > 0;
  const hasNextLesson = currentFlatIndex < flattenedLessons.length - 1
    && (!path || path.lessons.find((item) => item.lessonId === flattenedLessons[currentFlatIndex + 1]?.lesson.id)?.state !== 'locked');

  // Keep the browser copy of progress in step with the server's strict lesson path.
  useEffect(() => {
    if (!path || !course?.modules) return;
    setProgress(applyServerPath(user?.uid || 'local_student', courseId, course.modules, path.lessons));
  }, [path, course, courseId, user]);

  const lessonVideos = currentLesson
    ? [
        { id: 'main', title: currentLesson.title, url: courseEdits[courseId]?.videos?.[currentLesson.id] || lessonVideo(courseId, currentLesson.id) || currentLesson.videoUrl },
        ...(currentLesson.moreVideos || []).filter((video) => video.url).map((video, index) => ({ id: video.id, title: video.title || `Part ${index + 2}`, url: video.url })),
      ]
    : [];
  const actionSteps = (currentLesson?.actionSteps || '').split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
  const currentVideo = lessonVideos.find((video) => video.id === videoChoice[currentLesson?.id || '']) || lessonVideos[0] || { id: 'main', title: '', url: '' };

  // Video finished: tell the server. The lesson is only complete once every later step is done too.
  const handleVideoEnded = () => {
    if (currentLesson) reportWatch(currentLesson.id, 100, currentVideo.id);
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const next = flattenedLessons[currentFlatIndex + 1];
      setActiveModuleIndex(next.moduleIndex);
      setActiveLessonIndex(next.lessonIndex);
      setStarted((prev) => ({ ...prev, [next.lesson.id]: true }));
    }
  };

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      const prev = flattenedLessons[currentFlatIndex - 1];
      setActiveModuleIndex(prev.moduleIndex);
      setActiveLessonIndex(prev.lessonIndex);
      setStarted((state) => ({ ...state, [prev.lesson.id]: true }));
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
          <span className="font-semibold text-[#111827]">Preparing your classroom…</span>
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
  const isCurrentLessonDone = currentPath?.state === 'done';

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
        {/* ── TOP CLASSROOM HEADER BAR (WHITE BACKGROUND) ── */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-sm backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Link
              href="/student"
              aria-label="Back to Dashboard"
              className="p-2 shrink-0 text-slate-600 hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex min-w-0 max-w-md items-center gap-2">
              <span className="hidden md:inline-block bg-[#FACC15] text-[#111827] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                {course.category || 'Course'}
              </span>
              <h1 className="font-display font-bold text-xs sm:text-sm text-[#111827] truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Right Header Progress & Certificate Trigger */}
          <div className="flex shrink-0 items-center gap-4">
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
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 font-medium whitespace-nowrap sm:px-3">
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
            {/* Lesson video (client layout): the cover picture shows first; the video runs once the
                student presses play or picks a lesson. */}
            <div className="w-full">
              {currentLesson && !started[currentLesson.id] ? (
                <button
                  type="button"
                  onClick={() => setStarted((prev) => ({ ...prev, [currentLesson.id]: true }))}
                  className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl"
                  aria-label={`Play ${currentLesson.title}`}
                >
                  {course.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
                  <span className="absolute left-1/2 top-[36%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center sm:top-1/2 sm:h-20 sm:w-20 justify-center rounded-full bg-[#FACC15] text-[#111827] shadow-2xl transition group-hover:scale-110">
                    <PlayCircle className="h-7 w-7 sm:h-10 sm:w-10" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-3 text-left sm:p-5">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-[#FACC15]">{currentModule?.title}</span>
                    <span className="mt-1 line-clamp-2 font-display text-sm font-extrabold text-white sm:text-xl">{currentLesson.title}</span>
                  </span>
                </button>
              ) : (
                <SecureVideoPlayer
                  videoUrl={currentLesson ? currentVideo.url || undefined : undefined}
                  poster={course.thumbnail}
                  title={lessonVideos.length > 1 ? `${currentLesson?.title} · ${currentVideo.title}` : currentLesson?.title || course.title}
                  studentName={userProfile?.name || user?.displayName || 'Student Learner'}
                  studentEmail={user?.email || 'student@example.com'}
                  onEnded={handleVideoEnded}
                  onProgress={(percent) => {
                    if (!currentLesson) return;
                    recordWatch(watchKey(currentLesson.id, currentVideo.id), percent);
                    reportWatch(currentLesson.id, percent, currentVideo.id);
                    setWatchTick(percent);
                  }}
                  onNextLesson={hasNextLesson ? handleNextLesson : undefined}
                  onPrevLesson={hasPrevLesson ? handlePrevLesson : undefined}
                  autoPlayNext={prefs.autoPlayNext}
                  defaultSpeed={prefs.speed}
                  autoStart
                />
              )}
            </div>

            {/* ── CLASSROOM TABS (client layout): Overview · Modules · Classroom · Message ── */}
            <nav aria-label="Classroom" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm scrollbar-none sm:flex sm:overflow-x-auto">
              {([
                { key: 'overview', label: 'Overview', icon: FileText },
                { key: 'modules', label: 'Modules', icon: Layers },
                { key: 'classroom', label: 'Classroom', icon: ClipboardList },
                { key: 'message', label: 'Message', icon: Mail },
              ] as { key: TopTab; label: string; icon: typeof FileText }[]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTopTab(key)}
                  aria-current={topTab === key ? 'page' : undefined}
                  className={`flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-all whitespace-nowrap ${topTab === key ? 'bg-[#FACC15] text-[#111827] shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-[#111827]'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {topTab === 'overview' && currentLesson && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {lessonVideos.length > 1 ? `Video ${lessonVideos.findIndex((video) => video.id === currentVideo.id) + 1} of ${lessonVideos.length}: watched ${watchPercent(watchKey(currentLesson.id, currentVideo.id))}%. Watch 80% of every video to finish this step.` : `Watched ${watchPercent(currentLesson.id)}%. Watch 80% to finish this step.`}
                  </p>
                  <label htmlFor="lesson-notes" className="block text-xs font-bold text-slate-500">Lesson notes</label>
                  <textarea
                    id="lesson-notes"
                    value={noteText}
                    onChange={(e) => { setNoteText(e.target.value); setNoteSaved(false); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-20"
                    placeholder="Write your own notes for this lesson. Only you can see them."
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200"
                      onClick={() => { saveLessonNote(currentLesson.id, noteText); setNoteSaved(true); }}
                    >
                      Save notes
                    </button>
                    {noteSaved && <span className="text-xs font-semibold text-emerald-700">Saved ✓</span>}
                  </div>
                </div>
              )}

              {topTab === 'modules' && (<>{currentPath && path ? (
                <LessonSteps
                  section="steps"
                  courseId={courseId}
                  lesson={currentPath}
                  lives={path.lives}
                  timeline={path.timeline}
                  rank={path.rank}
                  rankTotal={path.rankTotal}
                  onOpenTab={openPart}
                  onChanged={() => loadPath(currentLesson?.id)}
                />
              ) : <p className="text-sm text-slate-500">Loading the lesson path…</p>}
                {Boolean(community.data?.shorts.length) && (
                  <section className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                    <h3 className="font-display text-base font-bold text-[#111827]">Short videos</h3>
                    <ShortVideoList videos={community.data!.shorts} />
                  </section>
                )}
              </>)}

              {topTab === 'classroom' && (<>{currentPath && path ? (
                <LessonSteps
                  section="lives"
                  courseId={courseId}
                  lesson={currentPath}
                  lives={path.lives}
                  timeline={path.timeline}
                  rank={path.rank}
                  rankTotal={path.rankTotal}
                  onOpenTab={openPart}
                  onChanged={() => loadPath(currentLesson?.id)}
                />
              ) : <p className="text-sm text-slate-500">Loading live classes…</p>}
                <section className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <h3 className="font-display text-base font-bold text-[#111827]">Course discussion</h3>
                  {community.data
                    ? <DiscussionBoard posts={community.data.discussions} onAction={community.post} canManage={community.data.canManage} />
                    : <p className="text-sm text-slate-500">{community.error || 'Loading the discussion…'}</p>}
                </section>
              </>)}

              {topTab === 'message' && (
                <div className="max-w-xl space-y-6">
                  <CampusMessageForm
                    onSent={() => setSentCount((count) => count + 1)}
                    kind="student"
                    lockedKind
                    defaultName={userProfile?.name || user?.displayName || ''}
                    defaultEmail={user?.email || ''}
                    context={{ courseId, courseTitle: course.title, moduleTitle: currentModule?.title || '', lessonId: currentLesson?.id || '', lessonTitle: currentLesson?.title || '' }}
                  />
                  <MyMessages courseId={courseId} email={user?.email || ''} refresh={sentCount} />
                </div>
              )}
            </div>

            {path?.examsPaused && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">Exams are paused for you in this course. Please contact your instructor.</div>
            )}
            {path?.notices?.map((notice) => (
              <div key={notice.id} className={`rounded-2xl border p-4 text-sm ${notice.kind === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
                <p className="text-[11px] font-extrabold uppercase tracking-wide">{notice.kind === 'warning' ? 'Warning' : notice.kind === 'study' ? 'Recommended study' : 'Message'} from {notice.by}</p>
                <p className="mt-1 whitespace-pre-line font-medium">{notice.text}</p>
              </div>
            ))}
            {/* ── LESSON ACTION & CONTROLS BAR ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">
                  {currentModule?.title}
                </div>
                <h2 className="font-display font-bold text-base sm:text-lg text-[#111827]">
                  {currentLesson?.title}
                </h2>
                {currentModule && currentLesson && lessonWindowLabel(currentModule.lessons || [], activeLessonIndex) && (
                  <p className="text-xs font-semibold text-slate-500">{lessonWindowLabel(currentModule.lessons || [], activeLessonIndex)}</p>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handlePrevLesson}
                  disabled={!hasPrevLesson}
                  className="w-12 shrink-0 sm:w-auto p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  title="Previous Lecture"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div
                  title="A lesson is complete once every step is done: video, quiz, assignment, exam and live class or approval."
                  className={`flex-1 sm:flex-none min-h-10 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${
                    isCurrentLessonDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCurrentLessonDone ? 'Completed ✓' : 'Finish all steps'}</span>
                </div>

                <button
                  onClick={handleNextLesson}
                  disabled={!hasNextLesson}
                  className="w-12 shrink-0 sm:w-auto p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  title="Next Lecture"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>


            {/* ── LESSON TABS (client layout): Overview & Study Notes · video · Quiz · Assignment · Ask Instructor · Exams · Resources ── */}
            <div id="classroom-panel" className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <nav aria-label="Lesson" className="grid grid-cols-2 gap-1.5 border-b border-slate-100 p-2 scrollbar-none sm:flex sm:overflow-x-auto">
                {([
                  { key: 'overview', label: 'Overview & Study Notes', icon: FileText },
                  { key: 'video', label: 'Video', icon: PlayCircle },
                  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
                  { key: 'assignment', label: 'Assignment', icon: FileCheck },
                  { key: 'ask-instructor', label: 'Ask Instructor', icon: MessageSquare },
                  { key: 'exams', label: 'Exams', icon: Award },
                  { key: 'resources', label: 'Resources', icon: Download },
                ] as { key: ClassTab; label: string; icon: typeof FileText }[]).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    aria-current={activeTab === key ? 'page' : undefined}
                    className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold transition-all first:col-span-2 first:justify-center sm:min-h-10 sm:whitespace-nowrap sm:px-3.5 sm:first:col-span-1 ${activeTab === key ? 'bg-[#111827] text-[#FACC15]' : 'text-slate-600 hover:bg-slate-100 hover:text-[#111827]'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="space-y-6 p-6 sm:p-7">
                {activeTab === 'overview' && (
                  <div className="space-y-6 text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
                    <h3 className="font-display text-base font-bold text-[#111827]">Lecture Core Takeaways &amp; Drill Focus</h3>
                    {currentLesson?.overview ? (
                      <div className="space-y-4">
                        <p className="whitespace-pre-line">{currentLesson.overview}</p>
                        {partButton('overview')}
                      </div>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">No overview for this lesson yet. Watch the video to continue.</p>
                    )}
                    {actionSteps.length > 0 && (
                      <div className="rounded-2xl border border-[#FACC15]/50 bg-[#FEF9C3]/60 p-5">
                        <p className="flex items-center gap-2 font-display text-sm font-extrabold text-[#111827]"><Sparkles className="h-4 w-4 text-[#A16207]" />Action Step For This Lesson:</p>
                        <ul className="mt-3 list-disc space-y-2 pl-5">
                          {actionSteps.map((step, index) => <li key={index}>{step}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'video' && currentLesson && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Watch at least 80% of {lessonVideos.length > 1 ? 'every video' : 'the video'} to finish this step.</p>
                    <ul className="space-y-2">
                      {lessonVideos.map((video, index) => {
                        const watched = watchPercent(watchKey(currentLesson.id, video.id));
                        const on = video.id === currentVideo.id && started[currentLesson.id];
                        return (
                          <li key={video.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setVideoChoice((prev) => ({ ...prev, [currentLesson.id]: video.id }));
                                setStarted((prev) => ({ ...prev, [currentLesson.id]: true }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-sm transition ${on ? 'border-[#FACC15] bg-[#FEF9C3]/60' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${watched >= 80 ? 'bg-emerald-500 text-white' : 'bg-[#111827] text-[#FACC15]'}`}>{watched >= 80 ? '✓' : index + 1}</span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-bold text-[#111827]">{index === 0 ? currentLesson.title : video.title}</span>
                                <span className="text-xs text-slate-500">{video.url ? `Watched ${watched}%` : 'Video will be added soon'}</span>
                              </span>
                              <PlayCircle className="h-5 w-5 shrink-0 text-[#A16207]" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {activeTab === 'quiz' && currentLesson && (
                  <LessonQuiz courseId={courseId} lessonId={currentLesson.id} onChanged={() => loadPath(currentLesson.id)} />
                )}

                {activeTab === 'assignment' && currentLesson && (
                  <LessonAssignment courseId={courseId} lessonId={currentLesson.id} onChanged={() => loadPath(currentLesson.id)} />
                )}

                {activeTab === 'ask-instructor' && currentLesson && (
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

                {activeTab === 'ask-instructor' && currentLesson && community.data && (
                  <section className="space-y-3 border-t border-slate-100 pt-5">
                    <h3 className="font-display text-base font-bold text-[#111827]">Relevant questions</h3>
                    {/* Questions of this lesson, then the ones that cover its module or the whole course. */}
                    <QuestionList questions={community.data.questions
                      .filter((item) => item.lessonId === currentLesson.id || (!item.lessonId && (!item.moduleId || item.moduleId === currentModule?.id)))
                      .sort((a, b) => Number(b.lessonId === currentLesson.id) - Number(a.lessonId === currentLesson.id))} />
                  </section>
                )}

                {activeTab === 'exams' && <LessonExams courseId={courseId} />}

                {activeTab === 'resources' && (
                  <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">
                    <h3 className="font-display text-base font-bold text-[#111827]">Notes and resources</h3>
                    {currentLesson?.notes && currentPath?.steps.find((step) => step.key === 'notes')?.state === 'locked' ? (
                      // Locked until the quiz is passed: show why, not the notes themselves.
                      <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">{currentPath?.steps.find((step) => step.key === 'notes')?.detail || 'Opens after the quiz is passed.'}</p>
                    ) : currentLesson?.notes ? (
                      <>
                        <p className="whitespace-pre-line break-words">
                          {currentLesson.notes.split(/(https?:\/\/[^\s]+)/g).map((part, index) => (
                            /^https?:\/\//.test(part)
                              ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline break-all">{part}</a>
                              : <span key={index}>{part}</span>
                          ))}
                        </p>
                        {partButton('notes')}
                      </>
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">No resources for this lesson yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              RIGHT COLUMN (32% width): Scrollable Course Curriculum
             ═════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
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
                                // Picking a lesson runs its video (client layout).
                                setStarted((prev) => ({ ...prev, [les.id]: true }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                                <span className="min-w-0">
                                  <span className="block truncate">{les.title}</span>
                                  {lessonWindowLabel(mod.lessons || [], lIdx) && (
                                    <span className="block text-[10px] font-semibold text-amber-700">{lessonWindowLabel(mod.lessons || [], lIdx)}</span>
                                  )}
                                </span>
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

            {/* Reviews (client layout: right column, under the diploma) */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-extrabold text-[#111827]"><Star className="h-4 w-4 text-amber-500" />Reviews</h3>
              <CourseReviewForm courseId={courseId} courseTitle={course?.title || 'this course'} />
            </div>
          </div>
        </main>

        {/* ── CERTIFICATE CELEBRATION MODAL ── */}
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          courseId={courseId}
        />
      </div>
    </AuthGuard>
  );
}
