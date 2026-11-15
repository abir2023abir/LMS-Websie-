import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Calculator, ReceiptText, WalletCards, type LucideIcon } from 'lucide-react';

const services: { name: string; icon: LucideIcon }[] = [
  { name: 'Bookkeeping', icon: BookOpenCheck },
  { name: 'Tax', icon: ReceiptText },
  { name: 'Accounting', icon: Calculator },
  { name: 'Payroll', icon: WalletCards },
];

export default function ServiceSection() {
  return (
    <section id="services" className="bg-[#FEFCE8] py-16 text-[#111827] sm:py-24">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)]">
            <Image
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=700&fit=crop"
              alt="Accounts, a calculator and financial paperwork on a desk"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-5">
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Your Business Finance, Managed by Experts.
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Get professional consultancy services — in one place. Simplify your business finances with expert guidance and reliable solutions.
            </p>
            <div className="flex lg:justify-end">
              <Link
                href="/bookkeeping"
                className="group inline-flex items-center rounded-full bg-[#FACC15] py-2.5 pl-6 pr-1.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#FACC15]/20 transition-all hover:bg-[#eab308]"
              >
                <span>Explore</span>
                <span className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827]">
                  <ArrowRight className="h-4 w-4 text-[#FACC15]" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {services.map(({ name, icon: Icon }) => (
            <li key={name}>
              <Link
                href="/bookkeeping"
                className="flex min-h-16 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 font-display text-base font-extrabold text-[#111827] shadow-[0_16px_36px_-24px_rgba(17,24,39,0.35)] transition hover:-translate-y-1 hover:border-[#FACC15]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#FACC15]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mx-auto max-w-3xl text-center text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
          From daily bookkeeping to financial planning, get the professional business support your business needs to grow.
        </p>
      </div>
    </section>
  );
}
