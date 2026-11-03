import { CalendarCheck, FileStack, MessagesSquare, UserRound } from 'lucide-react';

const steps = [
  { icon: CalendarCheck, title: 'Book an Introduction', detail: 'Tell us about your business and bookkeeping needs.' },
  { icon: UserRound, title: 'Meet Your Bookkeeper', detail: 'Discuss your records, priorities, and service requirements.' },
  { icon: FileStack, title: 'Share Your Documents', detail: 'Share the relevant financial records and files.' },
  { icon: MessagesSquare, title: 'Review Your Reports', detail: 'Review completed work and discuss any questions.' },
];

export default function GettingStarted() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-extrabold tracking-[0.16em] text-slate-500">GETTING STARTED</p>
      <h2 className="mt-2 font-display text-3xl font-extrabold text-[#111827] sm:text-4xl">Four steps to clearer books</h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><Icon className="h-5 w-5" /></span>
                <span className="font-display text-sm font-extrabold text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
