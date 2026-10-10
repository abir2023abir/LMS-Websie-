'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getQuizForModule, type ModuleQuiz, type QuizQuestionItem } from '@/lib/quiz-data';
import { saveModuleQuizResult, getFallbackCourseData } from '@/lib/progress';
import { getCourseById } from '@/lib/db';
import type { CourseSchema } from '@/types/course';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Check,
  X,
  Flag,
  Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentModuleQuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const moduleId = (params?.moduleId as string) || 'mod-1';
  const courseId = searchParams.get('courseId') || '1';

  const [course, setCourse] = useState<CourseSchema | null>(null);
  const [quiz, setQuiz] = useState<ModuleQuiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Selected answers: questionId -> selected option index
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Submission & scoring state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load course and quiz
  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);
      let fetchedCourse = await getCourseById(courseId);
      if (!fetchedCourse || !fetchedCourse.modules) {
        fetchedCourse = getFallbackCourseData(courseId);
      }
      setCourse(fetchedCourse);

      const moduleQuiz = getQuizForModule(moduleId, courseId);
      setQuiz(moduleQuiz);
      setTimeLeft(moduleQuiz.timeLimitSeconds);
      setLoading(false);
    }

    loadQuizData();
  }, [moduleId, courseId]);

  // Live Timer Countdown Effect
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, isSubmitted, timeLeft]);

  // Format MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Evaluate and submit quiz
  const evaluateQuiz = async (submittedAnswers: Record<number, number>) => {
    if (!quiz) return;

    setIsTimerRunning(false);

    let correct = 0;
    quiz.questions.forEach((q) => {
      if (submittedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const percent = Math.round((correct / quiz.questions.length) * 100);
    const passed = percent >= quiz.passThreshold;

    setCorrectCount(correct);
    setScorePercentage(percent);
    setIsPassed(passed);
    setIsSubmitted(true);

    const userId = user?.uid || 'local_student';

    // Save result and unlock next module if passed
    if (course?.modules) {
      await saveModuleQuizResult(
        userId,
        courseId,
        moduleId,
        passed,
        percent,
        course.modules
      );
    }

    // Trigger celebration confetti if passed
    if (passed) {
      try {
        const confettiModule = (await import('canvas-confetti')).default;
        confettiModule({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#10B981', '#6366F1', '#38BDF8'],
        });
      } catch {}
    }
  };

  const handleSubmitQuiz = () => {
    evaluateQuiz(answers);
  };

  const handleAutoSubmit = () => {
    evaluateQuiz(answers);
  };

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleToggleFlag = (questionId: number) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleRetake = () => {
    if (!quiz) return;
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    setTimeLeft(quiz.timeLimitSeconds);
    setIsSubmitted(false);
    setIsPassed(false);
    setIsTimerRunning(true);
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl">
          <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-[#111827]">Loading Module Assessment...</span>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft < 60;

  return (
    <AuthGuard allowedRole="Student">
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
        {/* ── TOP ASSESSMENT HEADER BAR ── */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-40 shadow-xs backdrop-blur-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <Link
              href={`/student/learn/${courseId}`}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#111827] p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Classroom</span>
            </Link>

            {/* Assessment Title */}
            <div className="text-center min-w-0 flex-1 max-w-md">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block truncate">
                {quiz.moduleTitle}
              </span>
              <h1 className="font-display font-bold text-xs sm:text-sm text-[#111827] truncate">
                {quiz.title}
              </h1>
            </div>

            {/* Live Countdown Timer */}
            {!isSubmitted ? (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-extrabold text-xs sm:text-sm transition-all ${
                  isTimeWarning
                    ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-sm shadow-rose-200'
                    : 'bg-amber-50 border-amber-200 text-[#111827]'
                }`}
              >
                <Clock className={`w-4 h-4 ${isTimeWarning ? 'text-rose-500' : 'text-amber-500'}`} />
                <span>{formattedTime}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                <span>Completed</span>
              </div>
            )}
          </div>
        </header>

        {/* ── MAIN ASSESSMENT CONTAINER ── */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
          {/* ═════════════════════════════════════════════════════════
              VIEW A: ACTIVE QUIZ IN PROGRESS
             ═════════════════════════════════════════════════════════ */}
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Progress & Navigator Bar */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#111827]">
                    Question {currentIdx + 1} of {totalQuestions}
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {answeredCount} of {totalQuestions} Answered
                  </span>
                </div>

                {/* Linear progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-[#FACC15] h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Question jumping pills */}
                <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 scrollbar-none">
                  {quiz.questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = currentIdx === idx;
                    const isFlag = flagged[q.id];

                    let pillClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
                    if (isCurrent) {
                      pillClass = 'bg-[#111827] text-[#FACC15] shadow-md scale-105 border-[#111827]';
                    } else if (isAnswered) {
                      pillClass = 'bg-amber-100 text-[#111827] border-amber-300 font-bold';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition-all relative flex-shrink-0 ${pillClass}`}
                      >
                        {idx + 1}
                        {isFlag && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="bg-[#FEF9C3] text-[#111827] border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        Topic: {currentQ.topicTag}
                      </span>
                      <h2 className="font-display font-bold text-lg sm:text-xl text-[#111827] pt-2 leading-relaxed">
                        {currentQ.question}
                      </h2>
                    </div>

                    {/* Flag for Review Button */}
                    <button
                      onClick={() => handleToggleFlag(currentQ.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                        flagged[currentQ.id]
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                      title="Flag question for later review"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {flagged[currentQ.id] ? 'Flagged' : 'Flag'}
                      </span>
                    </button>
                  </div>

                  {/* 4 MCQ Option Choices */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 text-xs sm:text-sm transition-all flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-[#FEFCE8] border-[#111827] text-[#111827] font-bold shadow-md'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span
                              className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#111827] text-[#FACC15] border-[#111827]'
                                  : 'bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{option}</span>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#111827] text-[#FACC15] flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Actions */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {currentIdx < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-6 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-7 py-3 rounded-xl bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#FACC15]/25 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Assessment</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════
                VIEW B: INSTANT ASSESSMENT RESULTS & UNLOCK DASHBOARD
               ═════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Score Announcement Banner */}
              <div
                className={`rounded-3xl border-2 p-8 sm:p-10 shadow-lg text-center space-y-6 ${
                  isPassed
                    ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50 border-amber-300'
                    : 'bg-gradient-to-b from-rose-50 via-white to-rose-50 border-rose-200'
                }`}
              >
                {/* Score Gauge Badge */}
                <div className="relative inline-flex items-center justify-center">
                  <div
                    className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center shadow-xl ${
                      isPassed
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-rose-400 bg-rose-50 text-rose-900'
                    }`}
                  >
                    <span className="font-display font-black text-3xl leading-none">
                      {scorePercentage}%
                    </span>
                    <span className="text-[10px] font-extrabold uppercase mt-1">
                      {correctCount}/{totalQuestions} Correct
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  {isPassed ? (
                    <>
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> Module Mastered & Next Lecture Unlocked!
                      </div>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-[#111827]">
                        Outstanding Performance! 🎉
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        You scored above the 80% passing standard. Your mastery has been logged in the database, and the subsequent module is now fully unlocked.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 border border-rose-300 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" /> 80% Required to Unlock Next Module
                      </div>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-[#111827]">
                        Assessment Incomplete ({scorePercentage}%)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        You need at least 4 out of 5 questions (80%) correct to proceed. Review the lecture explanations below and retake the drill when ready.
                      </p>
                    </>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {isPassed ? (
                    <Link
                      href={`/student/learn/${courseId}`}
                      className="bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#FACC15]/30 flex items-center gap-2"
                    >
                      <span>Proceed to Next Module</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={`/student/learn/${courseId}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-2 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Review Lessons</span>
                      </Link>

                      <button
                        onClick={handleRetake}
                        className="bg-[#111827] hover:bg-slate-800 text-[#FACC15] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Assessment</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Question Review Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <h3 className="font-display font-bold text-lg text-[#111827]">
                    Comprehensive Answer Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review each question, your submitted response, and expert linguistic rationale.
                  </p>
                </div>

                <div className="space-y-6">
                  {quiz.questions.map((q, qIdx) => {
                    const studentChoice = answers[q.id];
                    const isCorrect = studentChoice === q.correctIndex;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border p-5 space-y-4 ${
                          isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400">
                              Question {qIdx + 1} • {q.topicTag}
                            </span>
                            <h4 className="font-bold text-sm text-[#111827]">{q.question}</h4>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Options comparison */}
                        <div className="space-y-2 text-xs">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = studentChoice === oIdx;
                            const isRightAnswer = q.correctIndex === oIdx;

                            let optStyle = 'bg-white border-slate-200 text-slate-600';
                            if (isRightAnswer) {
                              optStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                            } else if (isSelected && !isRightAnswer) {
                              optStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-3 rounded-xl border flex items-center justify-between ${optStyle}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isRightAnswer && (
                                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-white/70 px-2 py-0.5 rounded-full">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Linguistic explanation callout */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-medium space-y-1">
                          <div className="font-bold text-[#111827] flex items-center gap-1.5 text-[11px] uppercase">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Linguistic Takeaway:</span>
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
