import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

export const metadata: Metadata = {
  title: 'About Us — Career Bridge.Studio',
  description: 'Career Bridge.Studio offers practical courses in accounting, business finance, and digital skills, plus bookkeeping services for businesses.',
};

const points = [
  {
    icon: BookOpen,
    title: 'Structured courses',
    text: 'Each course is broken into short lessons with videos, notes, quizzes, and assignments, so you always know what to do next.',
  },
  {
    icon: Briefcase,
    title: 'Bookkeeping for businesses',
    text: 'Alongside our courses, our team keeps the books for small and growing businesses, so owners can focus on running the business.',
  },
  {
    icon: GraduationCap,
    title: 'A result you can check',
    text: 'Quizzes and assignments track your progress, and every completed course earns a certificate that anyone can verify online.',
  },
];

const figures = [
  { value: '3', label: 'Course tracks: Accounting, Business, Digital Skills' },
  { value: 'Verified', label: 'Certificates anyone can check online' },
  { value: '15 min', label: 'Consultation with our team' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="bg-gradient-to-b from-[#FACC15] to-[#EAB308] pt-28 lg:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-wider">About us</p>
          <h1 className="mt-2 font-display font-extrabold text-4xl sm:text-5xl tracking-tight max-w-3xl">
            Practical skills for your next career step.
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base font-medium text-[#111827]/80">
            Career Bridge.Studio helps learners build job-ready skills in accounting, business finance, and digital work — and helps businesses keep their books in order.
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
            We believe practical skills open doors. Our courses focus on what people actually use at work: recording transactions, reading financial reports, and working confidently with everyday digital tools. Mentors review assignments and answer questions, and guardians can follow the progress of a linked student.
          </p>
          <p>
            Beside the courses, we offer bookkeeping services for businesses — from monthly bookkeeping to catch-up work. Book a free consultation and our team will recommend the right plan.
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
            Book a consultation
          </Link>
        </div>
      </section>

      <EnglishFooter />
    </div>
  );
}
