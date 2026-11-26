'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Calculator, Check, LineChart, UserRoundCheck, type LucideIcon } from 'lucide-react';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';
import { taka } from '@/lib/utils';

const ICONS: LucideIcon[] = [BarChart3, LineChart, Calculator, UserRoundCheck];

/** Client layout, section 05: service tabs, then one card per service with "Read More". */
export default function PricingSelector({ content }: { content: BookkeepingPageContent }) {
  const [activeTab, setActiveTab] = useState(content.tabs[0] || 'Services');
  const [open, setOpen] = useState<string | null>(null);
  const visiblePlans = useMemo(() => content.plans.filter((plan) => plan.categories.includes(activeTab)), [activeTab, content]);

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-16">
      <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Simple, transparent pricing</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-[13px] text-slate-600 sm:mt-3 sm:text-base">{content.selectorHint || 'Pick the service you need to explore our services.'}</p>
      <div className="mx-auto mt-4 grid max-w-2xl grid-cols-2 gap-2 sm:mt-6">
        {content.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setOpen(null); }}
            aria-pressed={activeTab === tab}
            className={`min-h-11 rounded-full border px-2 text-xs font-bold transition sm:min-h-12 sm:px-5 sm:text-sm ${activeTab === tab ? 'border-[#111827] bg-[#111827] text-white' : 'border-slate-300 bg-white text-[#111827] hover:border-[#111827]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {visiblePlans.length === 0 ? (
        <p className="mx-auto mt-10 max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">Services for this option are being prepared. Book a consultation to discuss them.</p>
      ) : (
        <div className="mt-5 grid grid-flow-row-dense grid-cols-2 gap-2.5 sm:mt-10 md:grid-flow-row md:gap-5 lg:grid-cols-3">
          {visiblePlans.map((plan, index) => {
            const Icon = ICONS[index % ICONS.length];
            const expanded = open === plan.id;
            return (
              <article key={plan.id} className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl ${expanded ? 'col-span-2 md:col-span-1' : ''} ${plan.popular ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
                {plan.popular && <span className="absolute right-1.5 top-1.5 rounded-full bg-[#FACC15] px-2 py-0.5 text-[8px] sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">{content.popularBadge}</span>}
                <div className="flex flex-col items-center border-b border-slate-200 bg-[#f5f7fa] px-2 pb-2.5 pt-6 text-center sm:px-6 sm:py-7">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-[#FACC15] sm:h-14 sm:w-14 sm:rounded-2xl"><Icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true" /></span>
                  <p className="mt-2 font-display text-xs font-extrabold text-[#111827] sm:mt-4 sm:text-lg">{activeTab}</p>
                </div>
                <div className="flex flex-1 flex-col p-2.5 sm:px-6 sm:py-6">
                  <span className="self-start rounded-full bg-[#FEF9C3] px-3 py-1 text-[11px] font-bold text-[#A16207] max-md:hidden">[{activeTab}]</span>
                  <h3 className="font-display text-sm font-extrabold leading-snug text-[#111827] sm:mt-4 sm:text-xl">{plan.name}</h3>
                  <p className={`mt-1.5 text-xs leading-snug text-slate-600 sm:mt-2 sm:text-sm sm:leading-relaxed ${expanded ? '' : 'max-md:line-clamp-3'}`}>{plan.description}</p>
                  {plan.price > 0 && <p className="mt-2 font-display text-base font-extrabold text-[#111827] sm:mt-4 sm:text-2xl">{taka(plan.price)}<span className="ml-1 text-sm font-semibold text-slate-500">{content.monthlySuffix}</span></p>}
                  {expanded && plan.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{feature}</li>)}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-col items-stretch gap-1.5 pt-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:pt-6">
                    {plan.features.length > 0 && (
                      <button type="button" onClick={() => setOpen(expanded ? null : plan.id)} aria-expanded={expanded} className="inline-flex min-h-10 items-center justify-center gap-1.5 text-xs font-extrabold md:justify-start md:text-sm text-[#111827] hover:text-[#A16207] md:min-h-0">
                        <span aria-hidden="true" className="tracking-widest text-[#A16207]">•••</span> {expanded ? 'Show less' : 'Read More'} <ArrowRight className={`h-4 w-4 transition ${expanded ? '-rotate-90' : ''}`} />
                      </button>
                    )}
                    <Link href={`/contact?service=${encodeURIComponent(`Bookkeeping: ${plan.name}`)}#contact`} className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#111827] px-2 text-center text-[11px] font-bold md:px-4 md:text-xs text-white hover:bg-black">{plan.price > 0 ? content.monthlyCta : content.quoteCta}</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
