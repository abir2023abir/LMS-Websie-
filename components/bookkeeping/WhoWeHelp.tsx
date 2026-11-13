import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { bookkeepingIndustries } from '@/lib/bookkeeping-industries';

export default function WhoWeHelp() {
  return (
    <section className="bg-[#111827] px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-extrabold tracking-[0.18em] text-[#FACC15]">SERVICES</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-extrabold leading-tight sm:text-4xl">Bookkeeping services, named for the business</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-slate-300">Agencies & Creative, and every name beside it, is a service. Open the one that matches the work you do.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {bookkeepingIndustries.map((industry) => {
            const highlights = industry.focuses.flatMap((focus) => focus.points).slice(0, 3);
            return (
              <Link
                key={industry.slug}
                href={`/bookkeeping/${industry.slug}`}
                className="group flex h-full flex-col items-center rounded-3xl border border-white/10 bg-white px-6 py-8 text-center text-[#111827] shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#FACC15] hover:shadow-xl"
              >
                <span className="rounded-full bg-[#FACC15] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">Service</span>
                <h3 className="mt-4 max-w-xs font-display text-2xl font-extrabold leading-tight tracking-tight">{industry.name}</h3>
                <span className="mt-4 h-1 w-14 rounded-full bg-[#FACC15] transition-all duration-200 group-hover:w-24" />
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">{industry.blurb}</p>
                <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
                  {highlights.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#111827] px-5 text-sm font-bold text-white transition group-hover:bg-[#FACC15] group-hover:text-[#111827]">
                  Open this service
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
