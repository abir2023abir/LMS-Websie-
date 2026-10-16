'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { getCourseById } from '@/lib/db';
import { useCourseEdits } from '@/lib/course-edits-client';
import { addQuestion, lessonNote, lessonVideo, recordWatch, saveLessonNote, sendMessage, submitAssignment, watchPercent } from '@/lib/workspace';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscussionComment {
  id: string;
  author: string;
  avatar?: string;
  role: 'Student' | 'Instructor' | 'Mentor';
  date: string;
  text: string;
  likes: number;
  replies?: DiscussionComment[];
}

const initialDiscussions: DiscussionComment[] = [
  {
    id: 'c-1',
    author: 'Sarah Jenkins',
    role: 'Instructor',
    date: '1 day ago',
    text: 'Welcome to this capsule! Remember to practice shadow-speaking out loud at 1x speed after watching each dialogue breakdown.',
    likes: 24,
    replies: [
      {
        id: 'c-1-1',
        author: 'Md. Saiful Islam',
        role: 'Student',
        date: '18 hours ago',
        text: 'The connected speech drill at 04:30 really helped me understand how native speakers link consonant to vowel sounds!',
        likes: 8,
      },
    ],
  },
  {
    id: 'c-2',
    author: 'Tanvir Ahmed',
    role: 'Student',
    date: '2 days ago',
    text: 'Should we memorize all the idioms in the resource sheet or focus on the top 10 first?',
    likes: 5,
    replies: [
      {
        id: 'c-2-1',
        author: 'Sarah Jenkins',
        role: 'Instructor',
        date: '1 day ago',
        text: 'Great question! Focus on the top 5–10 high-frequency expressions and practice using them in your own daily voice notes.',
        likes: 12,
      },
    ],
  },
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const classroomQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary benefit of active listening and sentence chunking in spoken English?',
    options: [
      'It eliminates the need for any vocabulary building.',
      'It improves natural rhythm, intonation, and spontaneous thought formation.',
      'It allows speaking without proper grammar.',
      'It only applies to written English emails.',
    ],
    correctIndex: 1,
    explanation: 'Chunking words into natural rhythmic thought groups trains the brain to speak smoothly without translating word-for-word.',
  },
  {
    id: 2,
    question: 'In professional presentations, which phrase most effectively transitions between key arguments?',
    options: [
      'Moving on to our next critical point...',
      'Forget what I just said...',
      'Whatever comes next...',
      'Let’s stop here...',
    ],
    correctIndex: 0,
    explanation: '"Moving on to our next critical point" provides a structured, professional signpost for your audience.',
  },
  {
    id: 3,
    question: 'How should one handle spontaneous questions during an executive discussion?',
    options: [
      'Remain silent until the meeting ends.',
      'Acknowledge the question, pause briefly to frame your thoughts, and answer directly.',
      'Interrupt the speaker immediately.',
      'Leave the room.',
    ],
    correctIndex: 1,
    explanation: 'Acknowledging the prompt with a brief framing pause demonstrates composure, confidence, and clarity.',
  },
];

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
  const [assignmentText, setAssignmentText] = useState('');
  const [shortText, setShortText] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [messageNote, setMessageNote] = useState('');
  const courseEdits = useCourseEdits();
  const [watchTick, setWatchTick] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-0': true,
  });

  // Active tab beneath the video player
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz' | 'discussion' | 'resources'>('overview');

  // Certificate Modal state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Discussion state
  const [discussions, setDiscussions] = useState<DiscussionComment[]>(initialDiscussions);
  const [newCommentText, setNewCommentText] = useState('');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
    if (idx <= 0) return true;
    const prev = flattenedLessons[idx - 1];
    if (progress?.completedLessons[prev.lesson.id]) return true;
    return watchPercent(prev.lesson.id) >= 80;
  };

  const currentFlatIndex = flattenedLessons.findIndex(
    (item) => item.moduleIndex === activeModuleIndex && item.lessonIndex === activeLessonIndex
  );

  const hasPrevLesson = currentFlatIndex > 0;
  const hasNextLesson = currentFlatIndex < flattenedLessons.length - 1;

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

  // Quiz evaluation
  const handleAnswerOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    classroomQuizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  // Submit comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: DiscussionComment = {
      id: `c-${Date.now()}`,
      author: userProfile?.name || user?.displayName || 'Learner',
      role: 'Student',
      date: 'Just now',
      text: newCommentText.trim(),
      likes: 0,
    };

    setDiscussions((prev) => [newComment, ...prev]);
    setNewCommentText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#111827] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl">
          <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-[#111827]">Preparing Secure English Classroom...</span>
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
                {course.category || 'Capsule'}
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
                studentEmail={user?.email || 'student@englishcapsules.com'}
                onEnded={handleVideoEnded}
                onProgress={(percent) => {
                  if (!currentLesson) return;
                  recordWatch(currentLesson.id, percent);
                  setWatchTick(percent);
                }}
                onNextLesson={hasNextLesson ? handleNextLesson : undefined}
                onPrevLesson={hasPrevLesson ? handlePrevLesson : undefined}
              />
            </div>

            {currentLesson && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Watched {watchPercent(currentLesson.id)}%. The next lesson opens at 80%.
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
                <label className="block text-xs font-bold text-slate-500">Assignment</label>
                <textarea
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-16"
                  placeholder="Write the assignment answer"
                />
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-2 rounded-full bg-[#111827] text-white"
                  onClick={() => {
                    if (!assignmentText.trim()) return;
                    submitAssignment(currentLesson.id, user?.email || 'student@local', assignmentText);
                    setAssignmentText('');
                  }}
                >
                  Submit assignment
                </button>
                <label className="block text-xs font-bold text-slate-500">Short question</label>
                <input value={shortText} onChange={(e) => setShortText(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Add a short question for this lesson" />
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100"
                  onClick={() => {
                    if (!shortText.trim()) return;
                    addQuestion(shortText, ['Noted'], 0, 'short', currentLesson.id);
                    setShortText('');
                  }}
                >
                  Save short question
                </button>
                <label className="block text-xs font-bold text-slate-500">Message from this course</label>
                <input value={discussion} onChange={(e) => setDiscussion(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ask about this lesson" />
                <p className="text-[11px] text-slate-500">
                  {course?.title || 'This course'} · Rank {standing.rank} of {standing.total} · {standing.progress}% progress
                </p>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-2 rounded-full bg-slate-100"
                  onClick={async () => {
                    const text = discussion.trim();
                    if (!text) return;
                    const email = user?.email || '';
                    const courseTitle = course?.title || 'This course';
                    const context = `${courseTitle} · Rank ${standing.rank} of ${standing.total} · ${standing.progress}%`;
                    sendMessage(email || 'student@local', text, context);
                    if (!email) {
                      setMessageNote('Sign in with an email so the instructor, customer care, and admin can open this message.');
                      return;
                    }
                    const res = await fetch('/api/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        kind: 'student',
                        name: userProfile?.name || user?.displayName || 'Student',
                        email,
                        text,
                        courseId,
                        courseTitle,
                        rank: standing.rank,
                        rankTotal: standing.total,
                        progress: standing.progress,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      setMessageNote(data.message || 'Could not send.');
                      return;
                    }
                    setDiscussion('');
                    setMessageNote('Sent. The instructor, customer care, and admin panel can see this course and your rank.');
                  }}
                >
                  Send to inbox
                </button>
                {messageNote && <p className="text-xs font-semibold">{messageNote}</p>}
              </div>
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
                  { key: 'quiz', label: 'Knowledge Drill Quiz', icon: HelpCircle },
                  { key: 'discussion', label: `Community Q&A (${discussions.length})`, icon: MessageSquare },
                  { key: 'resources', label: 'Downloadable Resources', icon: Download },
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
                      In this capsule lecture, we deconstruct real-life conversation patterns, rhythm cadence, and natural idioms. Focus on mimicking the audio pitch contours and practicing full sentences without mental translation.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="font-bold text-[#111827] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Action Step For This Capsule:</span>
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
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {/* Timed Assessment Launcher Banner */}
                  <div className="bg-gradient-to-r from-[#111827] via-[#1a2234] to-[#111827] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FACC15]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Official Timed Assessment (5 Minutes)</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {currentModule?.title}: Mastery Quiz
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Score 80%+ on the timed assessment to automatically unlock the next module.
                      </p>
                    </div>

                    <Link
                      href={`/student/quiz/${currentModule?.id || 'mod-1'}?courseId=${courseId}`}
                      className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Start Timed Quiz →</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="font-display font-bold text-base text-[#111827]">
                        Practice Knowledge Check
                      </h3>
                      <p className="text-xs text-slate-500">Quick practice questions before attempting the official timed quiz.</p>
                    </div>

                    {quizSubmitted && (
                      <span className="bg-[#FACC15] text-[#111827] font-extrabold text-xs px-3.5 py-1 rounded-full shadow-xs">
                        Score: {calculateQuizScore()} / {classroomQuizQuestions.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {classroomQuizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                        <div className="font-bold text-[#111827] text-xs sm:text-sm">
                          {qIdx + 1}. {q.question}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[q.id] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;

                            let optionClasses = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionClasses = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                              } else if (isSelected && !isCorrect) {
                                optionClasses = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                              }
                            } else if (isSelected) {
                              optionClasses = 'bg-[#FACC15] border-[#111827] text-[#111827] font-bold shadow-sm';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerOption(q.id, oIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionClasses}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-[#FACC15]/20"
                    >
                      Submit Quiz & Check Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-200"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              )}

              {/* TAB 3: DISCUSSION COMMUNITY */}
              {activeTab === 'discussion' && (
                <div className="space-y-6">
                  {/* Post Comment Form */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Ask a question or share your learning progress..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#111827] shadow-sm font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4">
                    {discussions.map((c) => (
                      <div key={c.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#FACC15] text-[#111827] font-extrabold text-xs flex items-center justify-center shadow-xs">
                              {c.author.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#111827] text-xs flex items-center gap-1.5">
                                <span>{c.author}</span>
                                {c.role === 'Instructor' && (
                                  <span className="bg-[#111827] text-[#FACC15] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                    Mentor
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{c.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{c.likes}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-9">
                          {c.text}
                        </p>

                        {/* Nested Replies */}
                        {c.replies?.map((rep) => (
                          <div key={rep.id} className="ml-9 mt-3 bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-[#111827] font-bold text-[10px] flex items-center justify-center">
                                  {rep.author.charAt(0)}
                                </div>
                                <span className="font-bold text-[#111827] text-xs">{rep.author}</span>
                                {rep.role === 'Instructor' && (
                                  <span className="bg-[#111827] text-[#FACC15] text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                                    Mentor
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{rep.date}</span>
                            </div>
                            <p className="text-xs text-slate-700 pl-7 font-medium">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: RESOURCES */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  {[
                    { title: 'Lecture Study Notes & Vocabulary Cheat Sheet (PDF)', size: '2.4 MB', type: 'PDF' },
                    { title: 'Native Audio Dialogue & Pronunciation Practice Drill (MP3)', size: '8.1 MB', type: 'MP3' },
                    { title: 'Accredited Curriculum Syllabus & Completion Checklist', size: '1.1 MB', type: 'PDF' },
                  ].map((res, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-extrabold text-xs flex items-center justify-center border border-amber-200 flex-shrink-0">
                          {res.type}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827] text-xs sm:text-sm">{res.title}</div>
                          <div className="text-[10px] text-slate-400">{res.size}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading ${res.title}...`)}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#111827] border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  ))}
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
