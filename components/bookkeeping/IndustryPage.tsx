import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import ConsultationForm from '@/components/bookkeeping/ConsultationForm';
import type { BookkeepingIndustry } from '@/lib/bookkeeping-industries';

export default function IndustryPage({ industry }: { industry: BookkeepingIndustry }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#111827]">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-16 pt-32 sm:px-6 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link href="/bookkeeping" className="inline-flex items-center gap-1 text-xs font-bold text-[#111827]/70 hover:text-[#111827]"><ArrowLeft className="h-3.5 w-3.5" /> All bookkeeping</Link>
          <p className="mt-5 text-xs font-extrabold tracking-[0.16em] text-[#111827]/70">{industry.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{industry.headline}</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-[#111827]/80 sm:text-base">{industry.description}</p>
          <a href="#consultation" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#111827] px-6 text-sm font-extrabold text-white hover:bg-black">Book Consultation</a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-extrabold tracking-[0.16em] text-slate-500">WHERE WE FOCUS</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">Core focus areas</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {industry.focuses.map((focus) => (
            <article key={focus.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold">{focus.title}</h3>
              <ul className="mt-4 space-y-3">
                {focus.points.map((point) => <li key={point} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-extrabold tracking-[0.16em] text-slate-500">WHAT YOU GET</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Support that stays with the business</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industry.values.map((value) => (
              <article key={value.title} className="rounded-3xl border border-slate-200 bg-[#f5f7fa] p-5">
                <h3 className="font-display text-base font-bold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ConsultationForm />
      <EnglishFooter />
    </div>
  );
}
