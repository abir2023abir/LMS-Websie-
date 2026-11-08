import Link from 'next/link';
import { Check } from 'lucide-react';
import { bookkeepingIndustries } from '@/lib/bookkeeping-industries';

export default function WhoWeHelp() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">WHO WE HELP</p>
        <h2 className="mt-2 text-center font-display text-3xl font-extrabold text-[#111827] sm:text-4xl">A bookkeeping service for your kind of business</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">Each card is a service we provide. Open one to see the records and reports included for that business.</p>
        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-2">
          {bookkeepingIndustries.map((industry, index) => {
            const highlights = industry.focuses.flatMap((focus) => focus.points).slice(0, 3);
            const featured = index === 0;
            return (
              <article key={industry.slug} className={`relative flex h-full flex-col rounded-3xl bg-white px-6 py-7 shadow-sm ${featured ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Featured service</span>}
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Service</p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#111827]">{industry.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{industry.blurb}</p>
                <p className="mt-6 text-sm font-bold text-[#111827]">What this service covers</p>
                <ul className="mt-3 flex-1 space-y-3">
                  {highlights.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/bookkeeping/${industry.slug}`} className={`mt-6 flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-bold ${featured ? 'bg-[#111827] text-white hover:bg-black' : 'border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white'}`}>See this service</Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
