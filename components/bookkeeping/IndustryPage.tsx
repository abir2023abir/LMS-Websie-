import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import ConsultationBookingForm from '@/components/messages/ConsultationBookingForm';
import { getContactBookingContent } from '@/lib/contact-booking-content';
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
        <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">WHERE WE FOCUS</p>
        <h2 className="mt-2 text-center font-display text-3xl font-extrabold">Services included for this business</h2>
        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
          {industry.focuses.map((focus, index) => (
            <article key={focus.title} className={`relative flex h-full flex-col items-center rounded-3xl bg-white px-6 py-8 text-center shadow-sm ${index === 0 ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
              {index === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Core service</span>}
              <h3 className="font-display text-xl font-extrabold">{focus.title}</h3>
              <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
              <p className="mt-5 text-sm font-bold">Included</p>
              <ul className="mt-3 w-full space-y-3 text-left">
                {focus.points.map((point) => <li key={point} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">WHAT YOU GET</p>
          <h2 className="mt-2 text-center font-display text-3xl font-extrabold">What stays with the service</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industry.values.map((value, index) => (
              <article key={value.title} className={`relative flex h-full flex-col items-center rounded-3xl bg-[#f5f7fa] px-6 py-8 text-center ${index === 0 ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
                {index === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Included</span>}
                <h3 className="font-display text-xl font-extrabold">{value.title}</h3>
                <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
                <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{value.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ConsultationBookingForm sectionId="consultation" initialService="Bookkeeping" content={getContactBookingContent()} />
      <EnglishFooter />
    </div>
  );
}
