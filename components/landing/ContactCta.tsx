import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';

/** The small "contact and consultation" box. The meeting calendar itself lives on the Contact page only. */
export default function ContactCta({ id = 'contact', service = '' }: { id?: string; service?: string }) {
  const href = `/contact${service ? `?service=${encodeURIComponent(service)}` : ''}#contact`;
  return (
    <section id={id} className="scroll-mt-28 bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl bg-[#111827] p-6 text-center text-white sm:flex-row sm:text-left">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FACC15] text-[#111827]">
          <CalendarDays className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold">Contact &amp; Consultation</h2>
          <p className="mt-1 text-sm text-slate-300">For contact or consultation, click this button.</p>
        </div>
        <Link
          href={href}
          className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[#FACC15] py-1.5 pl-6 pr-1.5 text-sm font-extrabold text-[#111827] transition-colors hover:bg-[#EAB308] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:w-auto"
        >
          <span>Book a Meeting</span>
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111827]">
            <ArrowRight className="h-4 w-4 text-[#FACC15] transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
