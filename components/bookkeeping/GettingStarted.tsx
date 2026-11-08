import { Check } from 'lucide-react';

const steps = [
  { title: 'Book an Introduction', detail: 'Tell us about your business and bookkeeping needs.', included: 'A short call to match the right service' },
  { title: 'Meet Your Bookkeeper', detail: 'Discuss your records, priorities, and service requirements.', included: 'One bookkeeper assigned to your account' },
  { title: 'Share Your Documents', detail: 'Share the relevant financial records and files.', included: 'A clear list of the files we need' },
  { title: 'Review Your Reports', detail: 'Review completed work and discuss any questions.', included: 'Monthly reports you can read and question' },
];

export default function GettingStarted() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">GETTING STARTED</p>
      <h2 className="mt-2 text-center font-display text-3xl font-extrabold text-[#111827] sm:text-4xl">How the service begins</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">Four steps, the same way a plan is laid out above the price. Each step is part of the service.</p>
      <ol className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2">
        {steps.map((step, index) => {
          const featured = index === 0;
          return (
            <li key={step.title} className={`relative flex h-full flex-col rounded-3xl bg-white px-6 py-7 shadow-sm ${featured ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
              {featured && <span className="absolute -top-3 left-6 rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">Start here</span>}
              <p className="font-display text-sm font-extrabold text-slate-400">Step 0{index + 1}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-[#111827]">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.detail}</p>
              <p className="mt-6 text-sm font-bold text-[#111827]">Included</p>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                <span>{step.included}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
