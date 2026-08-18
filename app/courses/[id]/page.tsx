'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/player/VideoPlayer';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { getCourseById } from '@/lib/db';
import { featuredCourses } from '@/lib/data';
import type { CourseSchema, ModuleSchema, LessonSchema } from '@/types/course';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | undefined>(undefined);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('Introduction & Overview');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ 'mod-0': true });

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      if (!courseId) return;

      const fetched = await getCourseById(courseId);

      if (fetched) {
        setCourse(fetched);
      } else {
        const match = featuredCourses.find((c) => c.id === courseId || c.slug === courseId);
        if (match) {
          const fallbackCourse: CourseSchema = {
            id: match.id,
            title: match.title,
            description: match.description,
            instructorId: match.instructor.name,
            instructorName: match.instructor.name,
            price: match.price,
            originalPrice: match.originalPrice,
            thumbnail: match.thumbnail,
            category: match.category,
            level: match.level,
            rating: match.rating,
            reviewCount: match.reviewCount,
            studentCount: match.studentCount,
            duration: match.duration,
            lessonCount: match.lessonCount,
            modules: [
              {
                id: 'mod-0',
                title: 'Module 1: Foundations & Getting Started',
                lessons: [
                  { id: 'l1', title: '1.1 Course Orientation & Goals', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '08:15' },
                  { id: 'l2', title: '1.2 Architecture Overview & Setup', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '14:20' },
                ],
              },
              {
                id: 'mod-1',
                title: 'Module 2: Advanced Core Concepts',
                lessons: [
                  { id: 'l3', title: '2.1 Building Real-World Applications', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '18:45' },
                  { id: 'l4', title: '2.2 Performance Optimization & Security', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '22:10' },
                ],
              },
            ],
          };
          setCourse(fallbackCourse);
        }
      }
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleSelectLesson = (lesson: LessonSchema) => {
    setActiveLessonTitle(lesson.title);
    if (lesson.videoUrl) {
      setActiveVideoUrl(lesson.videoUrl);
    }
  };

  const handleOpenCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = () => {
    setIsEnrolled(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center text-slate-400">
          Loading course details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center">
          <h2 className="font-display font-bold text-3xl mb-4">Course Not Found</h2>
          <p className="text-slate-400 mb-6">The course you are looking for does not exist or has been removed.</p>
          <Link href="/courses">
            <Button variant="primary" size="md">Browse All Courses</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full flex-1">
        {/* ── COURSE HEADER HERO ── */}
        <div className="relative glass rounded-3xl border border-white/10 p-6 sm:p-10 mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/15 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
            {/* Left 2 Cols: Main Info & Video Player */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {course.category || 'Web Development'}
                </span>
                <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {course.level || 'Beginner'}
                </span>
                {isEnrolled && (
                  <span className="badge bg-accent-500/20 text-accent-300 border border-accent-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Enrolled
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                {course.title}
              </h1>

              {/* Sub-description */}
              <p className="text-slate-300 text-base leading-relaxed">
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{course.rating || 4.8}</span>
                  <span className="text-slate-500">({(course.reviewCount || 1200).toLocaleString()} reviews)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{(course.studentCount || 15000).toLocaleString()} students</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration || '24h 30m'}</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold border border-white/10">
                  {course.instructorName ? course.instructorName.charAt(0) : 'I'}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Created by</div>
                  <div className="text-sm font-semibold text-white">{course.instructorName || 'Lead Instructor'}</div>
                </div>
              </div>

              {/* ── VIDEO PLAYER COMPONENT ── */}
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Video Preview & Player
                </h3>
                <VideoPlayer
                  videoUrl={activeVideoUrl}
                  poster={course.thumbnail}
                  title={activeLessonTitle}
                  isEnrolled={isEnrolled}
                  onEnrollClick={handleOpenCheckout}
                />
              </div>
            </div>

            {/* Right 1 Col: Sticky Enrollment Card */}
            <div className="lg:col-span-1 lg:sticky lg:top-28">
              <div className="glass rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-800 border border-white/10">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-dark-900/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary-600/90 text-white flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-extrabold text-3xl text-white">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-slate-500 line-through text-lg">
                      ${course.originalPrice}
                    </span>
                  )}
                </div>

                {/* Main Action Button */}
                {isEnrolled ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    You are Enrolled in this Course!
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="xl"
                    fullWidth
                    onClick={handleOpenCheckout}
                    id="course-enroll-now-btn"
                    rightIcon={<Zap className="w-5 h-5" />}
                  >
                    Enroll Now
                  </Button>
                )}

                {/* Included Highlights */}
                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="font-semibold text-white text-sm mb-2">This course includes:</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-400" /> {course.duration || '24 hours'} on-demand video
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-400" /> {course.lessonCount || 24} downloadable lessons
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-400" /> Certificate of completion
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary-400" /> Full lifetime access
                  </div>
                </div>

                <div className="border-t border-white/8 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>30-Day Money-Back Guarantee</span>
                  <button className="text-slate-400 hover:text-white flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABBED NAVIGATION (OVERVIEW vs CURRICULUM) ── */}
        <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8">
          {/* Tab Buttons */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`font-display font-semibold text-lg pb-2 transition-all ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-primary-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`font-display font-semibold text-lg pb-2 transition-all ${
                activeTab === 'curriculum'
                  ? 'text-white border-b-2 border-primary-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Curriculum & Lessons ({course.modules?.length || 2} Modules)
            </button>
          </div>

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
              <div>
                <h3 className="font-display font-bold text-lg text-white mb-3">About This Course</h3>
                <p>{course.description}</p>
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-white mb-3">What You Will Learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Build production-ready web applications from scratch',
                    'Master modern TypeScript, Next.js 14 App Router, and Tailwind CSS',
                    'Integrate cloud backend databases and authentication flows',
                    'Deploy scalable web apps to production with zero downtime',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-white mb-3">Instructor Bio</h3>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {course.instructorName ? course.instructorName.charAt(0) : 'I'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base">{course.instructorName || 'Senior Software Engineer'}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Industry expert with over 10+ years of building software at scale.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: CURRICULUM ── */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-4">
                Click on any video lesson to load it in the player above. {isEnrolled ? 'You are enrolled and have full access.' : 'Enroll to play video content.'}
              </p>

              {course.modules && course.modules.length > 0 ? (
                course.modules.map((mod, modIdx) => {
                  const isOpen = !!openModules[mod.id || `mod-${modIdx}`];
                  return (
                    <div
                      key={mod.id || modIdx}
                      className="glass rounded-2xl border border-white/8 overflow-hidden"
                    >
                      {/* Module Accordion Header */}
                      <button
                        onClick={() => toggleModule(mod.id || `mod-${modIdx}`)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-primary-400" />
                          <span className="font-semibold text-white text-sm sm:text-base">
                            {mod.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{mod.lessons?.length || 0} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Module Lessons List */}
                      {isOpen && (
                        <div className="divide-y divide-white/5 bg-dark-900/60 p-2">
                          {mod.lessons && mod.lessons.length > 0 ? (
                            mod.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelectLesson(lesson)}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary-500/10 text-left transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-primary-400 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white font-medium">
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                  {lesson.duration || '10:00'}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-slate-500">No lessons available in this module yet.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Curriculum details are being updated for this course.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── CHECKOUT MODAL COMPONENT ── */}
      <CheckoutModal
        course={course}
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <Footer />
    </div>
  );
}
