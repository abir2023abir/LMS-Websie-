'use client';

import { useMemo, useState } from 'react';
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
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:px-6">
      <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Simple, transparent pricing</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">{content.selectorHint || 'Pick the service you need to explore our services.'}</p>
      <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {content.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setOpen(null); }}
            aria-pressed={activeTab === tab}
            className={`min-h-12 rounded-full border px-5 text-sm font-bold transition ${activeTab === tab ? 'border-[#111827] bg-[#111827] text-white' : 'border-slate-300 bg-white text-[#111827] hover:border-[#111827]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {visiblePlans.length === 0 ? (
        <p className="mx-auto mt-10 max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">Services for this option are being prepared. Book a consultation to discuss them.</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan, index) => {
            const Icon = ICONS[index % ICONS.length];
            const expanded = open === plan.id;
            return (
              <article key={plan.id} className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ${plan.popular ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
                {plan.popular && <span className="absolute right-4 top-4 rounded-full bg-[#FACC15] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">{content.popularBadge}</span>}
                <div className="flex flex-col items-center border-b border-slate-200 bg-[#f5f7fa] px-6 py-7 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15]"><Icon className="h-7 w-7" aria-hidden="true" /></span>
                  <p className="mt-4 font-display text-lg font-extrabold text-[#111827]">{activeTab}</p>
                </div>
                <div className="flex flex-1 flex-col px-6 py-6">
                  <span className="self-start rounded-full bg-[#FEF9C3] px-3 py-1 text-[11px] font-bold text-[#A16207]">[{activeTab}]</span>
                  <h3 className="mt-4 font-display text-xl font-extrabold text-[#111827]">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{plan.description}</p>
                  {plan.price > 0 && <p className="mt-4 font-display text-2xl font-extrabold text-[#111827]">{taka(plan.price)}<span className="ml-1 text-sm font-semibold text-slate-500">{content.monthlySuffix}</span></p>}
                  {expanded && plan.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{feature}</li>)}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                    {plan.features.length > 0 && (
                      <button type="button" onClick={() => setOpen(expanded ? null : plan.id)} aria-expanded={expanded} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#111827] hover:text-[#A16207]">
                        <span aria-hidden="true" className="tracking-widest text-[#A16207]">•••</span> {expanded ? 'Show less' : 'Read More'} <ArrowRight className={`h-4 w-4 transition ${expanded ? '-rotate-90' : ''}`} />
                      </button>
                    )}
                    <a href="#consultation" className="inline-flex min-h-10 items-center rounded-full bg-[#111827] px-4 text-xs font-bold text-white hover:bg-black">{plan.price > 0 ? content.monthlyCta : content.quoteCta}</a>
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
