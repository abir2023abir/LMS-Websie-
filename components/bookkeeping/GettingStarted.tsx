const steps = [
  { title: 'Book a Consultation', detail: 'Tell us about your business and bookkeeping needs.' },
  { title: 'Meet Your Bookkeeper', detail: 'Discuss your records, priorities, and service requirements.' },
  { title: 'Share Your Documents', detail: 'Share the relevant financial records and files.' },
  { title: 'Review Your Reports', detail: 'Review completed work and discuss any questions.' },
];

export default function GettingStarted() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Getting Started Is Simple</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">Tell us about your business. We’ll discuss your needs and plan the next steps together.</p>
      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex h-full flex-col items-center rounded-3xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
            <span className="rounded-full bg-[#111827] px-3 py-1 font-display text-xs font-extrabold tracking-wider text-[#FACC15]">STEP 0{index + 1}</span>
            <h3 className="mt-4 font-display text-lg font-extrabold text-[#111827]">{step.title}</h3>
            <span className="mt-3 h-1 w-10 rounded-full bg-[#FACC15]" />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
