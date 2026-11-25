'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, ClipboardList, FileCheck, GraduationCap, HelpCircle, Layers, Lock, MessagesSquare, MonitorPlay, PlayCircle, type LucideIcon } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import InstructorAvatar from '@/components/courses/InstructorAvatar';
import { useCommunity } from '@/components/course/useCommunity';
import QuestionList from '@/components/course/QuestionList';

type Item = { id: string; title: string; place: string; maxScore?: number; questions?: number; passMark?: number; minutes?: number };
type Preview = {
  course: { id: string; title: string; description: string; category: string; type: string; instructorName: string; certification: string; outcomes: string[] };
  modules: { id: string; title: string; lessons: { id: string; title: string; duration: string }[] }[];
  assignments: Item[];
  quizzes: Item[];
  exams: Item[];
};
type Mentor = { id: string; name: string; bio: string };

const TABS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'lessons', label: 'Lessons', icon: Layers },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'exams', label: 'Exams', icon: GraduationCap },
  { id: 'discussion', label: 'Discussion', icon: MessagesSquare },
  { id: 'classroom', label: 'Classroom', icon: MonitorPlay },
] as const;
type TabId = (typeof TABS)[number]['id'];

const CLASSROOM_PARTS = ['Overview & Study Notes', 'Video lessons', 'Quiz', 'Assignment', 'Ask Instructor', 'Exams', 'Resources', 'Course discussion', 'Live classes'];

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
      <Icon className="mx-auto mb-2 h-6 w-6 text-slate-300" />
      {text}
    </div>
  );
}

function LockedList({ items, detail, icon, empty }: { items: Item[]; detail: (item: Item) => string; icon: LucideIcon; empty: string }) {
  if (!items.length) return <Empty icon={icon} text={empty} />;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
          <Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            {item.place && <span className="block truncate text-[11px] font-semibold text-slate-500">{item.place}</span>}
            <span className="block text-sm font-bold text-[#111827]">{item.title}</span>
            <span className="block text-xs text-slate-500">{detail(item)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Discussion({ courseId }: { courseId: string }) {
  const { data, error } = useCommunity(courseId);
  if (error) return <p role="alert" className="py-8 text-center text-sm text-slate-600">{error}</p>;
  if (!data) return <p className="py-8 text-center text-sm text-slate-500">Loading discussion…</p>;
  return (
    <div className="space-y-4">
      <QuestionList questions={data.questions} />
      <p className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
        <Lock className="h-4 w-4 shrink-0 text-slate-400" />The course discussion opens after enrollment.
      </p>
    </div>
  );
}

/** A read-only look at the classroom before enrolling: what is inside, without any lesson content. */
export default function ClassroomPreviewPage() {
  const params = useParams();
  const courseId = (params?.id as string) || '';
  const [data, setData] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [tab, setTab] = useState<TabId>('overview');

  useEffect(() => {
    fetch(`/api/courses/preview?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.message || 'Could not load the preview.');
        setData(body);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the preview.'));
    fetch(`/api/instructor/card?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((body) => setMentor(body.mentor || null))
      .catch(() => setMentor(null));
  }, [courseId]);

  const lessons = data?.modules.reduce((sum, mod) => sum + mod.lessons.length, 0) || 0;
  const coursePage = `/courses/${encodeURIComponent(courseId)}`;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-[#111827]">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div className="mx-auto max-w-7xl space-y-4">
          <Link href={coursePage} className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-xs font-extrabold text-[#111827]/80 hover:text-[#111827]">
            <ArrowLeft className="h-4 w-4" />Back to Course
          </Link>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em]">Classroom Preview</p>
          <h1 className="max-w-4xl font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{data?.course.title || 'Course'}</h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {error ? (
          <div className="space-y-4 py-16 text-center">
            <p role="alert" className="text-sm font-semibold text-slate-700">{error}</p>
            <Link href="/courses" className="inline-block rounded-xl bg-[#FACC15] px-6 py-3 text-xs font-bold shadow">Explore All Courses</Link>
          </div>
        ) : !data ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading preview…</p>
        ) : (
          <>
            <nav aria-label="Classroom preview parts" className="flex flex-wrap gap-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                  className={`flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-colors ${tab === id ? 'bg-[#FACC15] text-[#111827]' : 'bg-white text-slate-600 hover:text-[#111827]'}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </nav>

            <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{TABS.find((item) => item.id === tab)?.label}</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Preview Available</span>
              </div>

              {tab === 'overview' && (
                <div className="grid items-start gap-6 lg:grid-cols-12">
                  <div className="space-y-6 lg:col-span-8">
                    <section className="space-y-2">
                      <h3 className="font-display text-base font-bold">About This Course</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{data.course.description}</p>
                    </section>
                    <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="font-display text-base font-bold">Certification</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{data.course.certification}</p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="font-display text-base font-bold">Course Snapshot</h3>
                      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[['Total Lessons', lessons], ['Assignments', data.assignments.length], ['Quizzes', data.quizzes.length], ['Exams', data.exams.length]].map(([label, value]) => (
                          <div key={label} className="flex flex-col-reverse rounded-2xl border border-slate-200 p-4">
                            <dd className="font-display text-2xl font-extrabold">{value}</dd>
                            <dt className="text-xs font-semibold text-slate-500">{label}</dt>
                          </div>
                        ))}
                      </dl>
                    </section>
                    {data.course.outcomes.length > 0 && (
                      <section className="space-y-3">
                        <h3 className="font-display text-base font-bold">What You Will Learn</h3>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {data.course.outcomes.map((item) => (
                            <li key={item} className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{item}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                  <aside className="space-y-3 rounded-2xl border border-slate-200 p-5 lg:col-span-4">
                    <h3 className="font-display text-base font-bold">Course Instructor</h3>
                    <div className="flex items-center gap-3">
                      <InstructorAvatar instructorId={mentor?.id} name={mentor?.name || data.course.instructorName} />
                      <p className="text-sm font-bold">{mentor?.name || data.course.instructorName || 'Career Bridge Team'}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{mentor?.bio || 'Mentor profile and course support information.'}</p>
                  </aside>
                </div>
              )}

              {tab === 'lessons' && (lessons === 0 ? <Empty icon={Layers} text="Lessons will be added soon." /> : (
                <div className="space-y-4">
                  {data.modules.map((mod) => (
                    <section key={mod.id} className="overflow-hidden rounded-2xl border border-slate-200">
                      <h3 className="bg-slate-50 p-4 text-sm font-bold">{mod.title}</h3>
                      <ul className="divide-y divide-slate-100">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 p-4 text-sm">
                            <Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="min-w-0 flex-1 font-medium">{lesson.title}</span>
                            {lesson.duration && <span className="font-mono text-xs text-slate-400">{lesson.duration}</span>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ))}

              {tab === 'assignments' && <LockedList items={data.assignments} icon={ClipboardList} empty="No assignments yet." detail={(item) => `${item.maxScore} marks`} />}
              {tab === 'quizzes' && <LockedList items={data.quizzes} icon={HelpCircle} empty="No quizzes yet." detail={(item) => `${item.questions} questions · pass mark ${item.passMark}%${item.minutes ? ` · ${item.minutes} minutes` : ''}`} />}
              {tab === 'exams' && <LockedList items={data.exams} icon={FileCheck} empty="No exams yet." detail={(item) => `${item.questions} questions · ${item.minutes} minutes · pass mark ${item.passMark}%`} />}
              {tab === 'discussion' && <Discussion courseId={courseId} />}

              {tab === 'classroom' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">After enrollment your classroom opens with these parts, one lesson after another.</p>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CLASSROOM_PARTS.map((part) => (
                      <li key={part} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold"><Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />{part}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Link href={coursePage} className="inline-flex items-center gap-2 rounded-2xl bg-[#FACC15] px-8 py-4 text-sm font-extrabold shadow-lg hover:bg-[#EAB308]">
                <PlayCircle className="h-5 w-5" />Enroll Now
              </Link>
            </div>
          </>
        )}
      </main>
      <EnglishFooter />
    </div>
  );
}
