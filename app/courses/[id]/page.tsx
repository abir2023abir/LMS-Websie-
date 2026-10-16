'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import VideoPlayer from '@/components/player/VideoPlayer';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { getCourseById } from '@/lib/db';
import { getFallbackCourseData } from '@/lib/progress';
import { applyCourseEdit, loadCourseEdits } from '@/lib/course-edits-client';
import { takaFromUsd } from '@/lib/utils';
import type { CourseSchema, LessonSchema } from '@/types/course';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Globe,
  FileCheck,
  Check,
  ChevronsRight,
} from 'lucide-react';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = (params?.id as string) || '1';

  const [course, setCourse] = useState<CourseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(undefined);
  const [lessonVideos, setLessonVideos] = useState<Record<string, string>>({});
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('Introduction & Capsule Orientation');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ 'mod-1': true, 'mod-0': true });

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      if (!courseId) return;

      try {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const [found, edits] = await Promise.all([
          Promise.race([getCourseById(courseId).catch(() => null), timeout]),
          loadCourseEdits(),
        ]);
        const fetched = found?.modules ? found : getFallbackCourseData(courseId);

        if (fetched) {
          const edit = edits[courseId];
          const priced = applyCourseEdit(fetched, edit);
          setCourse(priced);
          setLessonVideos(edit?.videos || {});
          const first = priced.modules?.[0]?.lessons?.[0];
          if (first) {
            setActiveVideoUrl(edit?.videos?.[first.id] || first.videoUrl);
            setActiveLessonTitle(first.title);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleSelectLesson = (lesson: LessonSchema) => {
    setActiveLessonTitle(lesson.title);
    const saved = lessonVideos[lesson.id] || lesson.videoUrl;
    if (saved) setActiveVideoUrl(saved);
  };

  const handleOpenCheckout = () => {
    setShowCheckoutModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#111827] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl">
          <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-[#111827]">Loading English Capsule Details...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between">
        <FloatingNavbar />
        <main className="max-w-4xl mx-auto px-4 py-36 text-center space-y-4">
          <h1 className="text-2xl font-bold font-display text-[#111827]">English Capsule Not Found</h1>
          <p className="text-sm text-slate-600">The requested capsule might have been updated or moved.</p>
          <Link
            href="/courses"
            className="inline-block bg-[#FACC15] text-[#111827] font-bold text-xs px-6 py-3 rounded-xl shadow"
          >
            Explore All English Capsules
          </Link>
        </main>
        <EnglishFooter />
      </div>
    );
  }

  const modules = course.modules || [];
  let totalLessons = 0;
  modules.forEach((m) => {
    totalLessons += m.lessons?.length || 0;
  });

  const discount =
    course.originalPrice && course.price
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      {/* ── HERO BANNER HEADER ── */}
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-12 px-4 sm:px-6 lg:px-8 text-[#111827]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#111827]/80 hover:text-[#111827] transition-colors bg-black/5 px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All English Capsules</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="bg-[#111827] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {course.category || 'English Capsule'}
            </span>
            <span className="bg-white/80 text-[#111827] text-xs font-bold px-3 py-1 rounded-full border border-black/10">
              {course.level || 'Intermediate'}
            </span>
            <span className="bg-black/10 text-[#111827] text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Certified Diploma Included
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-tight max-w-4xl">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base text-[#111827]/90 leading-relaxed max-w-3xl font-medium">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#111827]/80 font-semibold">
            <div className="flex items-center gap-1.5 text-[#111827] font-bold">
              <Star className="w-4 h-4 fill-[#111827]" />
              <span className="text-sm">{course.rating || 4.9}</span>
              <span className="text-[#111827]/70 font-normal">
                ({(course.reviewCount || 12400).toLocaleString()} reviews)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{(course.studentCount || 85000).toLocaleString()} Students Enrolled</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>English (Native Audio + Practice Drills)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN 2-COLUMN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols): Tabs & Curriculum */}
          <div className="lg:col-span-7 space-y-6">
            {/* Instructor Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-[#111827] font-extrabold flex items-center justify-center text-lg shadow-md flex-shrink-0">
                {course.instructorName ? course.instructorName.charAt(0) : 'S'}
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Master Instructor</div>
                <div className="font-display font-bold text-base text-[#111827]">{course.instructorName || 'Lead Academic Faculty'}</div>
                <div className="text-xs text-slate-500">English Capsules Senior Language Faculty</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-none">
                {[
                  { key: 'overview', label: 'Overview & Outcomes', icon: BookOpen },
                  { key: 'curriculum', label: `Curriculum (${modules.length} Modules)`, icon: FileCheck },
                  { key: 'reviews', label: 'Reviews', icon: Star },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === key
                        ? 'bg-[#FACC15] text-[#111827] shadow-md shadow-[#FACC15]/20'
                        : 'text-slate-600 hover:text-[#111827] bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-xl text-[#111827] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>What You Will Master in This Capsule</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        'Speak fluently without translating word-for-word from your native language',
                        'Master sentence chunking, stress rhythms, and natural British/American intonation',
                        'Expand your active vocabulary with 1,000+ practical phrases and idioms',
                        'Overcome speech hesitation and nervousness in meetings and interviews',
                        'Construct sophisticated compound and complex sentences with correct grammar',
                        'Pass formal English evaluations and earn an accredited completion diploma',
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium"
                        >
                          <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs sm:text-sm">
                    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                      <h4 className="font-display font-bold text-[#111827] text-base">Course Prerequisites</h4>
                      <ul className="space-y-2 text-slate-600 list-disc list-inside">
                        <li>Basic understanding of simple English words.</li>
                        <li>Smartphone or computer with internet access.</li>
                        <li>20–30 minutes of vocal practice each day.</li>
                      </ul>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                      <h4 className="font-display font-bold text-[#111827] text-base">Who is This Capsule For?</h4>
                      <ul className="space-y-2 text-slate-600 list-disc list-inside">
                        <li>Working professionals aiming for career advancement.</li>
                        <li>Students preparing for IELTS, TOEFL, or study abroad.</li>
                        <li>Anyone looking to speak naturally and confidently.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CURRICULUM */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <div className="pb-2">
                    <h3 className="font-display font-bold text-lg text-[#111827]">Curriculum Breakdown</h3>
                    <p className="text-xs text-slate-500">
                      {modules.length} Modules • {totalLessons} Lectures • Total Duration: {course.duration || '24h'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {modules.map((mod) => {
                      const isOpen = openModules[mod.id] !== false;

                      return (
                        <div
                          key={mod.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                        >
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors gap-4"
                          >
                            <div className="space-y-1">
                              <div className="font-display font-bold text-[#111827] text-sm sm:text-base">
                                {mod.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {mod.lessons?.length || 0} Lectures
                              </div>
                            </div>

                            <div className="p-1.5 rounded-lg text-slate-500 bg-white border border-slate-200">
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="border-t border-slate-200 bg-white divide-y divide-slate-100">
                              {mod.lessons?.map((les) => (
                                <div
                                  key={les.id}
                                  onClick={() => handleSelectLesson(les)}
                                  className="p-4 flex items-center justify-between gap-4 text-xs sm:text-sm hover:bg-amber-50/50 transition-colors cursor-pointer text-slate-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <PlayCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <span className="font-medium text-[#111827]">{les.title}</span>
                                  </div>
                                  <span className="text-xs text-slate-400 font-mono">
                                    {les.duration || '10:00'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-xl text-[#111827]">Student Reviews & Ratings</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-amber-500 text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 font-bold text-[#111827]">{course.rating || 4.9} out of 5</span>
                        </div>
                        <span className="text-xs text-slate-500">• 98% Positive Feedback</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: 'Nusaiba Rahaman',
                        rating: 5,
                        date: '2 days ago',
                        review: 'The practice dialogues in this capsule are top tier. I was terrified of speaking during client calls, but after Module 2 my confidence skyrocketed!',
                      },
                      {
                        name: 'Tanvir Ahmed',
                        rating: 5,
                        date: '1 week ago',
                        review: 'Clear pronunciation drills and actionable explanations. The instructor makes even complex grammatical rules feel natural and effortless.',
                      },
                    ].map((rev, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-[#111827] text-sm">{rev.name}</div>
                          <div className="text-[10px] text-slate-400">{rev.date}</div>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Video Preview & Sticky Enrollment Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xl space-y-6 lg:sticky lg:top-28">
            {/* Trailer Video Player */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
              <VideoPlayer
                videoUrl={activeVideoUrl}
                poster={course.thumbnail}
                title={activeLessonTitle}
                isEnrolled={true}
              />
            </div>

            {/* Price & CTA */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enrollment Fee</div>
                  {course.price === 0 ? (
                    <span className="font-display font-black text-3xl text-emerald-600">FREE</span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-3xl text-[#111827]">{takaFromUsd(course.price)}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">{takaFromUsd(course.originalPrice)}</span>
                      )}
                    </div>
                  )}
                </div>

                {discount > 0 && (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-extrabold px-3 py-1 rounded-full">
                    Save {discount}% Today
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FACC15]/25"
                >
                  <PlayCircle className="w-5 h-5 fill-current" />
                  <span>Enroll in Capsule Now</span>
                </button>

                <Link
                  href={`/student/learn/${course.id}`}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-[#111827] font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                >
                  <span>Preview Classroom Environment</span>
                </Link>
              </div>

              {/* Perks Checklist */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 stroke-[3]" />
                  <span>Instant Lifetime Access to All {totalLessons || 24} Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 stroke-[3]" />
                  <span>Downloadable Study Notes & Practice Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 stroke-[3]" />
                  <span>Official English Capsules Diploma</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500 stroke-[3]" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── CHECKOUT MODAL ── */}
      {showCheckoutModal && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          course={course}
        />
      )}

      <EnglishFooter />
    </div>
  );
}
