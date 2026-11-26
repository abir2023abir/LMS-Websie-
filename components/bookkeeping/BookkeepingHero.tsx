import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';

const points = [
  'Bookkeeping support for your business',
  'Organized records and monthly reports',
  'Clear income and expense tracking',
  'Convenient online communication',
];

export default function BookkeepingHero() {
  return (
    <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-8 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-5 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#111827]/70">BOOKKEEPING SERVICES FOR YOUR BUSINESS</p>
          <h1 className="mt-3 max-w-xl font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-[#111827] sm:text-5xl">Your Books, Organized. Your Business, Clearer.</h1>
          <p className="mt-3 max-w-xl text-[13px] font-medium sm:mt-4 sm:text-sm leading-relaxed text-[#111827]/80 sm:text-base">Reliable bookkeeping and clear financial reports to help you understand your business finances.</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:block sm:space-y-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-1.5 text-xs font-semibold text-[#111827] sm:gap-2 sm:text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link href="/contact?service=Bookkeeping#contact" className="mt-5 inline-flex min-h-12 sm:mt-8 items-center justify-center rounded-full bg-[#111827] px-6 text-sm font-extrabold text-white shadow-lg shadow-black/15 transition hover:bg-black">Book a Consultation</Link>
        </div>
        <div className="relative mx-auto aspect-[2/1] w-full max-w-md sm:aspect-[4/5] overflow-hidden rounded-[28px] border-4 border-white/60 bg-[#111827] shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&h=1100&fit=crop"
            alt="A business owner reviewing financial records with a bookkeeper"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </div>
    </section>
  );
}
