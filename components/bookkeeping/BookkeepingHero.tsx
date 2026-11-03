import { Check, FileSpreadsheet } from 'lucide-react';

const points = [
  'Bookkeeping support for your business',
  'Organized records and monthly reports',
  'Clear income and expense tracking',
  'Convenient online communication',
];

export default function BookkeepingHero() {
  return (
    <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-16 pt-32 sm:px-6 lg:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#111827]/70">BOOKKEEPING SERVICES FOR YOUR BUSINESS</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-5xl">Your Books, Organized. Your Business, Clearer.</h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#111827]/80 sm:text-base">Reliable bookkeeping and clear financial reports to help you understand your business finances.</p>
          <ul className="mt-6 space-y-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm font-semibold text-[#111827]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <a href="#consultation" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#111827] px-6 text-sm font-extrabold text-white shadow-lg shadow-black/15 transition hover:bg-black">Book Consultation</a>
        </div>
        <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
          <div className="absolute -left-3 top-8 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
          <div className="relative rounded-[28px] border border-black/10 bg-[#111827] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FACC15]">
                <FileSpreadsheet className="h-4 w-4" /> Monthly report
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">This month</span>
            </div>
            <p className="mt-6 font-display text-3xl font-extrabold">Income & expenses</p>
            <div className="mt-6 space-y-3">
              {[['Service income', 'Recorded'], ['Operating costs', 'Sorted'], ['Profit snapshot', 'Ready']].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
                  <span>{label}</span>
                  <span className="font-bold text-[#FACC15]">{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -right-2 hidden w-40 rounded-2xl border border-slate-200 bg-white p-4 text-[#111827] shadow-xl sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next step</p>
            <p className="mt-1 text-sm font-extrabold">Review with your bookkeeper</p>
          </div>
        </div>
      </div>
    </section>
  );
}
