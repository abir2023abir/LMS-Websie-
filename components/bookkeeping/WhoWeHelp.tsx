import Link from 'next/link';
import { Briefcase, Home, Palette, Shirt, ShoppingCart, Sparkles, Stethoscope, UtensilsCrossed, Wrench, type LucideIcon } from 'lucide-react';
import { bookkeepingIndustries } from '@/lib/bookkeeping-industries';

// Client layout, section 04: nine industries in a 3 × 3 grid, in this order.
const CARDS: { slug: string; label: string; icon: LucideIcon }[] = [
  { slug: 'creative-agencies', label: 'Agencies & Creative', icon: Palette },
  { slug: 'consultants-freelancers', label: 'Consultants & Freelancers', icon: Briefcase },
  { slug: 'real-estate', label: 'Real Estate Services', icon: Home },
  { slug: 'ecommerce', label: 'E-Commerce Online', icon: ShoppingCart },
  { slug: 'restaurants', label: 'Restaurants & Cafés', icon: UtensilsCrossed },
  { slug: 'plumbers', label: 'Plumbers & Trade Contractors', icon: Wrench },
  { slug: 'spas', label: 'Spas & Wellness', icon: Sparkles },
  { slug: 'dry-cleaners', label: 'Dry Cleaners & Laundry', icon: Shirt },
  { slug: 'healthcare', label: 'Healthcare', icon: Stethoscope },
];

export default function WhoWeHelp() {
  const known = new Set(bookkeepingIndustries.map((industry) => industry.slug));
  return (
    <section id="industries" className="scroll-mt-28 bg-[#111827] px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-extrabold tracking-[0.18em] text-[#FACC15]">WHO WE HELP</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-extrabold leading-tight sm:text-4xl">Bookkeeping for Businesses Like Yours</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-slate-300">Practical bookkeeping support for different business needs and industries.</p>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.filter((card) => known.has(card.slug)).map(({ slug, label, icon: Icon }) => (
            <li key={slug}>
              {/* Each card opens the industry's own bookkeeping page. */}
              <Link
                href={`/bookkeeping/${slug}`}
                className="group flex h-full min-h-36 flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white px-5 py-7 text-center text-[#111827] shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#FACC15] hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FACC15]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF9C3] text-[#A16207] transition group-hover:bg-[#FACC15] group-hover:text-[#111827]">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-extrabold leading-snug">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center font-display text-base font-bold text-[#FACC15]">and 70+ more industries</p>
      </div>
    </section>
  );
}
