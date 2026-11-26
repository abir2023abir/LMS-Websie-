const steps = [
  { title: 'Book a Consultation', detail: 'Tell us about your business and bookkeeping needs.' },
  { title: 'Meet Your Bookkeeper', detail: 'Discuss your records, priorities, and service requirements.' },
  { title: 'Share Your Documents', detail: 'Share the relevant financial records and files.' },
  { title: 'Review Your Reports', detail: 'Review completed work and discuss any questions.' },
];

export default function GettingStarted() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Getting Started Is Simple</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-[13px] text-slate-600 sm:mt-3 sm:text-base">Tell us about your business. We’ll discuss your needs and plan the next steps together.</p>
      <ol className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white px-2.5 py-4 text-center shadow-sm sm:rounded-3xl sm:px-5 sm:py-8">
            <span className="rounded-full bg-[#111827] px-3 py-1 font-display text-xs font-extrabold tracking-wider text-[#FACC15]">STEP 0{index + 1}</span>
            <h3 className="mt-2 font-display text-sm font-extrabold leading-snug text-[#111827] sm:mt-4 sm:text-lg">{step.title}</h3>
            <span className="mt-2 h-1 w-8 rounded-full bg-[#FACC15] sm:mt-3 sm:w-10" />
            <p className="mt-2 text-xs leading-snug text-slate-600 sm:mt-3 sm:text-sm sm:leading-relaxed">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
