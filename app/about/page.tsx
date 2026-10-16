import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

export const metadata: Metadata = {
  title: 'About Us — English Capsules',
  description: 'English Capsules is a learning site for spoken English, IELTS, and live classes. Started in 2015.',
};

const points = [
  {
    icon: BookOpen,
    title: 'Short lessons',
    text: 'Each course is a capsule: a video, notes, a short quiz, and an assignment. The next lesson opens after you watch the one before it.',
  },
  {
    icon: Users,
    title: 'A teacher on the other side',
    text: 'Students write to their instructor. Guardians see only the learner linked to them. Service messages go to customer care and the admin.',
  },
  {
    icon: GraduationCap,
    title: 'A result you can check',
    text: 'Exams are marked, rank follows course progress, and a finished course can issue a certificate you can verify.',
  },
];

const figures = [
  { value: '2015', label: 'Teaching since' },
  { value: '10+', label: 'English programs' },
  { value: '4', label: 'Roles on one account' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="bg-gradient-to-b from-[#FACC15] to-[#EAB308] pt-28 lg:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider">About us</p>
          <h1 className="mt-2 font-display font-extrabold text-4xl sm:text-5xl tracking-tight max-w-3xl">
            English, taught in pieces you can finish.
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base font-medium text-[#111827]/80">
            English Capsules started in 2015. The site is a classroom: courses, live coaching, and a record of how far each student has gone.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {figures.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[#FACC15]/40 bg-[#FEFCE8] p-6 text-center">
              <div className="font-display font-extrabold text-3xl">{item.value}</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
          <p>
            The goal is not a long lecture. A student opens one lesson, watches it, writes a note, and answers a short question. Mentors review written work. A guardian can follow one linked student, and only that student.
          </p>
          <p>
            Beside the courses, the same site books live speaking, fluency, and IELTS sessions. Those requests and messages stay with customer care and the admin, so the class and the service desk can both be checked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {points.map((item) => (
            <article key={item.title} className="rounded-3xl border border-slate-200 p-6 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-[#111827] text-[#FACC15] flex items-center justify-center">
                <item.icon className="w-4 h-4" />
              </span>
              <h2 className="font-display font-bold text-lg">{item.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#111827] text-white font-bold text-sm px-5 py-3 rounded-full"
          >
            See the courses
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#FACC15] text-[#111827] font-bold text-sm px-5 py-3 rounded-full"
          >
            Contact the campus
          </Link>
        </div>
      </section>

      <EnglishFooter />
    </div>
  );
}
