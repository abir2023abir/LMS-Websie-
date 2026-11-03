'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';
import { taka } from '@/lib/utils';

export default function PricingSelector({ content }: { content: BookkeepingPageContent }) {
  const [activeTab, setActiveTab] = useState(content.tabs[0] || 'Services');
  const visiblePlans = useMemo(() => content.plans.filter((plan) => plan.categories.includes(activeTab)), [activeTab, content]);
  const discountMultiplier = 1 - content.annualDiscount / 100;
  const pricedPlans = visiblePlans.filter((plan) => plan.price > 0);
  const consultHref = '/bookkeeping#consultation';

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-center text-xs font-extrabold tracking-[0.16em] text-slate-500">SERVICES AND PRICING</p>
      <h2 className="mt-2 text-center font-display text-3xl font-extrabold text-[#111827]">Choose the support that fits</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">{content.selectorHint}</p>
      <div className="mt-6 flex snap-x gap-2 overflow-x-auto pb-2 sm:justify-center">
        {content.tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab} className={`min-h-12 shrink-0 snap-start rounded-full border px-5 text-sm font-bold transition ${activeTab === tab ? 'border-[#111827] bg-[#111827] text-white' : 'border-slate-200 bg-white text-[#111827] hover:border-[#111827]'}`}>{tab}</button>
        ))}
      </div>
      <div className={`mx-auto mt-8 grid max-w-5xl gap-5 ${visiblePlans.length >= 3 ? 'lg:grid-cols-3' : visiblePlans.length === 2 ? 'md:grid-cols-2' : 'max-w-xl'}`}>
        {visiblePlans.map((plan) => (
          <article key={plan.id} className={`relative flex h-full flex-col rounded-3xl bg-white px-6 py-7 shadow-sm ${plan.popular ? 'border-2 border-[#111827]' : 'border border-slate-200'}`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FACC15] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#111827]">{content.popularBadge}</span>}
            <h3 className="font-display text-xl font-bold text-[#111827]">{plan.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{plan.description}</p>
            {plan.price > 0 ? <p className="mt-6 font-display text-4xl font-extrabold text-[#111827]">{taka(plan.price)}<span className="ml-1 text-base font-semibold text-slate-500">{content.monthlySuffix}</span></p> : <p className="mt-6 font-display text-2xl font-extrabold text-[#111827]">Custom pricing<span className="mt-1 block text-sm font-medium text-slate-500">Quoted after a free consultation</span></p>}
            <Link href={consultHref} className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-[#111827] px-4 text-sm font-bold text-white hover:bg-black">{plan.price > 0 ? content.monthlyCta : content.quoteCta}</Link>
            <p className="mt-6 text-sm font-bold text-[#111827]">{content.includedHeading}</p>
            <ul className="mt-3 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />{feature}</li>)}</ul>
          </article>
        ))}
      </div>
      {pricedPlans.length > 0 && (
        <div className="mx-auto mt-12 max-w-5xl">
          <h3 className="text-center font-display text-xl font-bold text-[#111827]">{content.annualHeading}</h3>
          <div className={`mt-6 grid gap-5 ${pricedPlans.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
            {pricedPlans.map((plan) => {
              const annual = Math.round(plan.price * 12 * discountMultiplier);
              return (
                <article key={`${plan.id}-annual`} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h4 className="font-display text-lg font-bold">{plan.name}</h4>
                  <p className="mt-3 text-sm text-slate-400 line-through">{taka(plan.price * 12)}{content.annualSuffix}</p>
                  <p className="font-display text-3xl font-extrabold">{taka(annual)}<span className="ml-1 text-base font-semibold">{content.annualSuffix}</span></p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{content.annualDiscount}{content.annualDiscountCaption}</p>
                  <Link href={consultHref} className="mt-5 flex min-h-11 items-center justify-center rounded-full border-2 border-[#111827] text-sm font-bold hover:bg-[#111827] hover:text-white">{content.annualCta}</Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
