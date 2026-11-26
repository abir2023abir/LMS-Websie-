import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import ContactCta from '@/components/landing/ContactCta';
import type { BookkeepingIndustry } from '@/lib/bookkeeping-industries';

export default function IndustryPage({ industry }: { industry: BookkeepingIndustry }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#111827]">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-8 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link href="/bookkeeping" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-[#111827]/70 hover:text-[#111827] md:min-h-0"><ArrowLeft className="h-3.5 w-3.5" /> All bookkeeping</Link>
          <p className="mt-2 text-xs font-extrabold tracking-[0.16em] text-[#111827]/70 sm:mt-5">{industry.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[1.75rem] font-extrabold leading-tight sm:text-5xl">{industry.headline}</h1>
          <p className="mt-3 max-w-2xl text-[13px] font-medium sm:mt-4 sm:text-sm leading-relaxed text-[#111827]/80 sm:text-base">{industry.description}</p>
          <Link href="/contact?service=Bookkeeping#contact" className="mt-5 inline-flex min-h-12 sm:mt-8 items-center justify-center rounded-full bg-[#111827] px-6 text-sm font-extrabold text-white hover:bg-black">Book Consultation</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">WHERE WE FOCUS</p>
        <h2 className="mt-2 text-center font-display text-2xl font-extrabold sm:text-3xl">Services included for this business</h2>
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-x-2.5 gap-y-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
          {industry.focuses.map((focus, index) => (
            <article key={focus.title} className={`relative flex h-full flex-col items-center rounded-2xl bg-white px-2.5 py-4 text-center shadow-sm sm:rounded-3xl sm:px-6 sm:py-8 ${index === 0 ? 'col-span-2 border-2 border-[#111827] md:col-span-1' : 'border border-slate-200'}`}>
              {index === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Core service</span>}
              <h3 className="font-display text-sm font-extrabold sm:text-xl">{focus.title}</h3>
              <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
              <p className="mt-3 text-sm font-bold sm:mt-5">Included</p>
              <ul className="mt-2 w-full space-y-2 text-left sm:mt-3 sm:space-y-3">
                {focus.points.map((point) => <li key={point} className="flex items-start gap-1.5 text-xs text-slate-600 sm:gap-2 sm:text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-white px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">WHAT YOU GET</p>
          <h2 className="mt-2 text-center font-display text-2xl font-extrabold sm:text-3xl">What stays with the service</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-4 sm:mt-8 sm:gap-5 lg:grid-cols-3">
            {industry.values.map((value, index) => (
              <article key={value.title} className={`relative flex h-full flex-col items-center rounded-2xl bg-[#f5f7fa] px-2.5 py-4 text-center sm:rounded-3xl sm:px-6 sm:py-8 ${index === 0 ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
                {index === 0 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Included</span>}
                <h3 className="font-display text-sm font-extrabold sm:text-xl">{value.title}</h3>
                <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-600 sm:gap-2 sm:text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{value.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ContactCta id="consultation" service="Bookkeeping" />
      <EnglishFooter />
    </div>
  );
}
