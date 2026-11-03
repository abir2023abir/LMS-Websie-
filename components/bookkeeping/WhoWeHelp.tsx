import Link from 'next/link';
import { ArrowUpRight, Briefcase, Building2, Scissors, Shirt, ShoppingBag, Sparkles, Stethoscope, Store, UtensilsCrossed, Wrench } from 'lucide-react';
import { bookkeepingIndustries } from '@/lib/bookkeeping-industries';

const icons = [Briefcase, Sparkles, Building2, ShoppingBag, UtensilsCrossed, Wrench, Sparkles, Shirt, Stethoscope, Scissors];

export default function WhoWeHelp() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-extrabold tracking-[0.16em] text-slate-500">WHO WE HELP</p>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold text-[#111827] sm:text-4xl">Bookkeeping shaped around your kind of business</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {bookkeepingIndustries.map((industry, index) => {
            const Icon = icons[index] || Store;
            return (
              <Link key={industry.slug} href={`/bookkeeping/${industry.slug}`} className="group flex min-h-40 flex-col rounded-3xl border border-slate-200 bg-[#f5f7fa] p-5 transition hover:-translate-y-0.5 hover:border-[#111827] hover:bg-white hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><Icon className="h-5 w-5" /></span>
                <span className="mt-4 font-display text-base font-bold text-[#111827]">{industry.name}</span>
                <span className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">{industry.blurb}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#111827]">View <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
