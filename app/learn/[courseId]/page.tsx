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
  HelpCircle,
  Send,
  Download,
  ThumbsUp,
  Sparkles,
  Share2,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import Button from '@/components/ui/Button';

// Mock Quiz Questions for interactive self-evaluation
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which tense is best used to describe an action completed right before the present moment?',
    options: [
      'Present Simple',
      'Present Perfect ("have/has + past participle")',
      'Past Continuous',
      'Future Perfect',
    ],
    correctIndex: 1,
    explanation: 'The Present Perfect connects past actions with present relevance or recent completion (e.g., "I have just completed the lecture").',
  },
  {
    id: 2,
    question: 'In professional emails, which greeting is considered the most formal and courteous?',
    options: [
      'Hey there!',
      'Dear Mr./Ms. [Last Name],',
      'Yo!',
      'What’s up?',
    ],
    correctIndex: 1,
    explanation: '"Dear [Title] [Last Name]" is universally standard in formal professional business correspondence.',
  },
  {
    id: 3,
    question: 'What is the key difference between "Active Voice" and "Passive Voice"?',
    options: [
      'Active voice always uses longer sentences.',
      'In active voice, the subject performs the action; in passive voice, the subject receives the action.',
      'Active voice cannot use past tense.',
      'There is no grammatical difference.',
    ],
    correctIndex: 1,
    explanation: 'Active voice emphasizes the actor ("The instructor explained the rule"), making communication direct and engaging.',
  },
];

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

  // Classroom Active Tab: 'video' | 'quiz' | 'notes' | 'discussion'
  const [classroomTab, setClassroomTab] = useState<'video' | 'quiz' | 'notes' | 'discussion'>('video');

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Discussion Community State
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      author: 'Tanvir Ahmed',
      avatar: 'T',
      time: '2 hours ago',
      message: 'Could someone clarify the pronunciation difference in British vs American accents for "schedule"?',
      likes: 4,
      replies: [
        {
          author: 'Instructor Sarah',
          avatar: 'S',
          time: '1 hour ago',
          message: 'Great question! In British RP it is commonly pronounced /ʃɛdjuːl/ ("shed-yool"), while in US English it is /skɛdʒuːl/ ("sked-jool").',
        },
      ],
    },
    {
      id: 2,
      author: 'Nusaiba Rahaman',
      avatar: 'N',
      time: 'Yesterday',
      message: 'The practice dialogues in this lecture are super helpful! Practicing them out loud every morning.',
      likes: 8,
      replies: [],
    },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

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
                title: 'Module 1: Foundations & Core Pronunciation',
                lessons: [
                  { id: 'les-0-0', title: '1. Course Orientation & Learning Strategy', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '06:15' },
                  { id: 'les-0-1', title: '2. Daily Life Dialogue & Active Vocabulary', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '11:40' },
                  { id: 'les-0-2', title: '3. Sentence Structures & Fluency Drills', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '09:20' },
                ],
              },
              {
                id: 'mod-2',
                title: 'Module 2: Advanced Conversational Fluency',
                lessons: [
                  { id: 'les-1-0', title: '4. Handling Formal & Business Discussions', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '14:10' },
                  { id: 'les-1-1', title: '5. Accent Softening & Spontaneous Speaking', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: '12:30' },
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
      <div className="min-h-screen bg-[#0d131f] text-white flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
          <span>Loading classroom video & curriculum...</span>
        </div>
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d131f] text-white flex flex-col items-center justify-center p-4">
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

  // Progress metrics
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

  // Quiz evaluation
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    mockQuizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  // Post Discussion Question
  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setDiscussions([
      {
        id: Date.now(),
        author: 'You (Student)',
        avatar: 'Y',
        time: 'Just now',
        message: newQuestionText.trim(),
        likes: 0,
        replies: [],
      },
      ...discussions,
    ]);
    setNewQuestionText('');
  };

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-[#0d131f] text-white flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
        {/* ── CLASSROOM TOP BAR ── */}
        <header className="bg-[#111827] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
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
              <div className="border border-[#FACC15] px-2 py-0.5 rounded-md bg-black/40">
                <span className="font-extrabold text-[10px] text-[#FACC15] uppercase tracking-wider">
                  English Capsules
                </span>
              </div>
              <h1 className="font-display font-bold text-xs sm:text-sm text-white truncate max-w-md">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Header Indicator & Certificate shortcut */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium">
                Course Progress: <strong className="text-[#FACC15]">{completionPercent}%</strong>
              </span>
              <div className="w-36 bg-[#1a2234] h-1.5 rounded-full mt-1 overflow-hidden border border-white/5">
                <div
                  className="bg-[#FACC15] h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {completionPercent === 100 ? (
              <Link
                href="/verify-certificate"
                className="bg-[#FACC15] text-[#111827] font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-[#FACC15]/20 animate-pulse"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Claim Certificate</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleLessonComplete(currentLesson.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  completedLessons[currentLesson?.id]
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${completedLessons[currentLesson?.id] ? 'text-emerald-400 fill-emerald-400/20' : ''}`} />
                <span>{completedLessons[currentLesson?.id] ? 'Completed' : 'Mark Complete'}</span>
              </button>
            )}
          </div>
        </header>

        {/* ── CLASSROOM MAIN TWO-COLUMN LAYOUT ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* LEFT COLUMN: Media Player & Interactive Classroom Tabs (8 Cols on Desktop) */}
          <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Video Player Component */}
            <VideoPlayer
              videoUrl={currentLesson?.videoUrl}
              poster={course.thumbnail}
              title={currentLesson?.title || 'Lesson Video'}
              isEnrolled={true}
            />

            {/* Lesson Control & Title Bar */}
            <div className="bg-[#111827] rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-[11px] font-bold text-[#FACC15] uppercase tracking-wider">
                    {currentModule?.title}
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                    {currentLesson?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handlePrevLesson}
                    disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-semibold text-white transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextLesson}
                    className="px-4 py-2 rounded-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] text-xs font-extrabold transition-all flex items-center gap-1 shadow-md shadow-[#FACC15]/20"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── INTERACTIVE 4-TAB NAVIGATION ── */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
                {[
                  { key: 'video', label: 'Overview', icon: FileText },
                  { key: 'quiz', label: 'Practice Quiz & MCQ', icon: HelpCircle },
                  { key: 'notes', label: 'Lecture Notes & PDF', icon: BookOpen },
                  { key: 'discussion', label: 'Discussion Q&A', icon: MessageSquare },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setClassroomTab(key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      classroomTab === key
                        ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/20'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* ── TAB 1: OVERVIEW ── */}
              {classroomTab === 'video' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <p>
                    In this session, our instructors walk you through active speaking drills and real-world conversational English rules. Ensure you repeat all audio cues out loud and complete the self-assessment quiz to reinforce mastery.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-slate-300 flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#FACC15]" />
                      <span>Downloadable Vocabulary List</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-slate-300 flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-emerald-400" />
                      <span>3 Question Quick MCQ</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-slate-300 flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Verified Certificate Eligible</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: INTERACTIVE MCQ QUIZ ── */}
              {classroomTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base text-white">Module Assessment Quiz</h3>
                      <p className="text-xs text-slate-400">Test your comprehension with instant grading and explanation.</p>
                    </div>
                    {quizSubmitted && (
                      <button
                        onClick={handleResetQuiz}
                        className="flex items-center gap-1 text-xs text-[#FACC15] hover:underline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    {mockQuizQuestions.map((q, idx) => {
                      const selected = selectedAnswers[q.id];
                      return (
                        <div key={q.id} className="bg-[#1a2234] border border-white/10 rounded-2xl p-4 space-y-3">
                          <div className="font-semibold text-xs sm:text-sm text-white flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#FACC15] text-[#111827] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span>{q.question}</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pl-7">
                            {q.options.map((opt, optIdx) => {
                              let optionStyle = 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10';

                              if (selected === optIdx) {
                                optionStyle = 'bg-purple-600/30 border-purple-500 text-white font-semibold';
                              }

                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                } else if (selected === optIdx && selected !== q.correctIndex) {
                                  optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleAnswerSelect(q.id, optIdx)}
                                  className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && optIdx === q.correctIndex && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  )}
                                  {quizSubmitted && selected === optIdx && selected !== q.correctIndex && (
                                    <X className="w-4 h-4 text-rose-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="pl-7 text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/5">
                              <strong className="text-[#FACC15]">Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length < mockQuizQuestions.length}
                      className="w-full bg-[#FACC15] hover:bg-[#eab308] disabled:opacity-40 text-[#111827] font-extrabold text-xs sm:text-sm py-3 rounded-2xl transition-all shadow-lg shadow-[#FACC15]/20"
                    >
                      Submit Quiz for Evaluation
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-emerald-400 font-bold text-sm block">
                          Your Score: {quizScore} / {mockQuizQuestions.length} ({Math.round((quizScore / mockQuizQuestions.length) * 100)}%)
                        </span>
                        <span className="text-slate-300">
                          {quizScore >= 2 ? '🎉 Great job! You passed the module quiz.' : 'Keep practicing and retake to score 100%!'}
                        </span>
                      </div>
                      <Link
                        href="/verify-certificate"
                        className="bg-[#FACC15] text-[#111827] font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        View Certificate
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: LECTURE NOTES & PDF ── */}
              {classroomTab === 'notes' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-display font-bold text-white text-sm">Key Vocabulary & Phrases from Lecture:</h4>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                      <li><strong>Spontaneous Response:</strong> Formulating sentences immediately without translation latency.</li>
                      <li><strong>Collocations:</strong> Words that naturally co-occur (e.g. <em>take a break</em>, <em>make an effort</em>).</li>
                      <li><strong>Intonation Modulations:</strong> Raising or lowering pitch to express conviction vs questions.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-[#FACC15]" />
                      <div>
                        <div className="font-bold text-white">Lecture-01-Handout-Summary.pdf</div>
                        <div className="text-[10px] text-slate-400">PDF Document • 1.4 MB</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Handout downloaded!')}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 4: DISCUSSION COMMUNITY Q&A ── */}
              {classroomTab === 'discussion' && (
                <div className="space-y-6">
                  {/* Ask Question Form */}
                  <form onSubmit={handlePostQuestion} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Ask the instructor or community a question about this lecture..."
                      className="w-full bg-[#1a2234] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newQuestionText.trim()}
                        className="bg-[#FACC15] hover:bg-[#eab308] disabled:opacity-40 text-[#111827] font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Question</span>
                      </button>
                    </div>
                  </form>

                  {/* Discussions Feed */}
                  <div className="space-y-4">
                    {discussions.map((d) => (
                      <div key={d.id} className="bg-[#1a2234] border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FACC15] text-[#111827] font-bold flex items-center justify-center text-xs">
                              {d.avatar}
                            </div>
                            <div>
                              <span className="font-bold text-white">{d.author}</span>
                              <span className="text-slate-500 text-[10px] ml-2">{d.time}</span>
                            </div>
                          </div>
                          <span className="text-slate-400 text-[10px] flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-[#FACC15]" /> {d.likes}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 pl-9 leading-relaxed">{d.message}</p>

                        {/* Replies */}
                        {d.replies.map((rep, rIdx) => (
                          <div key={rIdx} className="ml-9 mt-2 bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-[#FACC15]">{rep.author}</span>
                              <span className="text-slate-500 text-[10px]">{rep.time}</span>
                            </div>
                            <p className="text-xs text-slate-300">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Curriculum Sidebar (4 Cols on Desktop) */}
          <div className="lg:col-span-4 bg-[#111827] border-l border-white/10 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-white">Course Curriculum</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {finishedCount} of {totalLessons} lectures completed ({completionPercent}%)
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-[#FACC15]" />
            </div>

            {/* Modules Accordion List */}
            <div className="space-y-3">
              {course.modules.map((mod, mIdx) => (
                <div key={mod.id || mIdx} className="bg-[#1a2234] rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-3.5 bg-white/5 font-semibold text-xs text-white flex items-center justify-between">
                    <span>{mod.title}</span>
                    <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
                      {mod.lessons?.length || 0} lessons
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 bg-[#111827]">
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
                              ? 'bg-[#FACC15]/10 text-[#FACC15] font-bold border-l-4 border-[#FACC15]'
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
                              className="accent-[#FACC15] rounded cursor-pointer flex-shrink-0"
                            />
                            <PlayCircle className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FACC15]' : 'text-slate-500'}`} />
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
