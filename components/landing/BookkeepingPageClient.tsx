'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronsRight } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';

export default function BookkeepingPageClient({ content }: { content: BookkeepingPageContent }) {
  const [activeTab, setActiveTab] = useState(content.tabs[0] || 'Services');
  const visiblePlans = useMemo(() => content.plans.filter((plan) => plan.categories.includes(activeTab)), [activeTab, content]);
  const discountMultiplier = 1 - content.annualDiscount / 100;
  const quoteLink = (plan: string, billing: 'month' | 'year') => `/contact?service=${encodeURIComponent(plan)}&billing=${billing}#contact`;

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#16324f]">
      <FloatingNavbar />
      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] px-4 pb-14 pt-32 sm:px-6 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3.5 py-1.5 text-white shadow-md">
            <span className="rounded-full bg-[#FACC15] p-1 text-[#111827]"><ChevronsRight className="h-3.5 w-3.5" /></span>
            <span className="text-xs font-semibold tracking-wide">{content.eyebrow}</span>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-5xl">{content.headline}</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#111827]/80 sm:text-base">{content.description}</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">{content.selectorHint}</p>
          <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
            {content.tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab} className={`min-h-12 shrink-0 snap-start rounded-full border px-5 text-sm font-bold transition-colors sm:px-6 ${activeTab === tab ? 'border-[#102b43] bg-[#102b43] text-white shadow-sm' : 'border-slate-200 bg-white text-[#16324f] hover:border-[#102b43]'}`}>{tab}</button>)}
          </div>
        </div>

        <div className={`mx-auto mt-8 grid max-w-5xl grid-cols-1 items-stretch gap-5 ${visiblePlans.length === 3 ? 'lg:grid-cols-3' : visiblePlans.length === 2 ? 'md:grid-cols-2 lg:max-w-4xl' : 'max-w-xl'}`}>
          {visiblePlans.map((plan) => <article key={plan.id} className={`relative flex h-full flex-col rounded-2xl bg-white px-6 py-7 shadow-sm sm:px-7 ${plan.popular ? 'border-2 border-[#2f9d78]' : 'border border-slate-200'}`}>
            {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#38a681] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">{content.popularBadge}</span>}
            <h2 className="font-display text-xl font-bold text-[#16324f]">{plan.name}</h2>
            <p className="mt-1 min-h-11 text-sm leading-relaxed text-slate-600">{plan.description}</p>
            {plan.note && <p className="mt-3 min-h-10 text-xs leading-relaxed text-slate-500">{plan.note}</p>}
            <p className="mt-7 font-display text-4xl font-extrabold tracking-tight text-[#16324f]">${plan.price}<span className="ml-1 text-base font-semibold text-slate-500">{content.monthlySuffix}</span></p>
            <Link href={quoteLink(plan.name, 'month')} className={`mt-6 flex min-h-12 items-center justify-center rounded-lg border-2 px-4 text-sm font-bold transition-colors ${plan.popular ? 'border-[#2f9d78] text-[#16324f] hover:bg-[#2f9d78] hover:text-white' : 'border-[#16324f] text-[#16324f] hover:bg-[#16324f] hover:text-white'}`}>{content.monthlyCta}</Link>
            <div className="mt-6 text-sm font-bold text-[#16324f]">{content.includedHeading}</div>
            <ul className="mt-3 space-y-3">{plan.features.map((feature, index) => <li key={`${plan.id}-${index}`} className="flex items-start gap-2 text-sm leading-snug text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} /><span>{feature}</span></li>)}</ul>
          </article>)}
          {visiblePlans.length === 0 && <article className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"><h2 className="font-display text-xl font-bold text-[#16324f]">{activeTab} services</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Tell us what your business needs and our team will prepare a suitable quote.</p><Link href={quoteLink(activeTab, 'month')} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#16324f] px-6 text-sm font-bold text-white hover:bg-[#244765]">{content.quoteCta}</Link></article>}
        </div>

        <section className="mt-14">
          <h2 className="text-center font-display text-xl font-bold text-[#16324f] sm:text-2xl">{content.annualHeading}</h2>
          <div className={`mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 ${visiblePlans.length === 3 ? 'lg:grid-cols-3' : visiblePlans.length === 2 ? 'md:grid-cols-2 lg:max-w-4xl' : 'max-w-xl'}`}>
            {visiblePlans.map((plan) => {
              const annual = Math.round(plan.price * 12 * discountMultiplier);
              return <article key={`${plan.id}-annual`} className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-7"><h3 className="font-display text-lg font-bold text-[#16324f]">{plan.name}</h3><p className="mt-4 text-sm text-slate-400 line-through">${plan.price * 12}{content.annualSuffix}</p><p className="mt-1 font-display text-3xl font-extrabold text-[#16324f]">${annual}<span className="ml-1 text-base font-semibold">{content.annualSuffix}</span></p><p className="mt-2 text-sm font-semibold text-emerald-700">{content.annualDiscount}{content.annualDiscountCaption}</p><Link href={quoteLink(plan.name, 'year')} className="mt-5 flex min-h-12 items-center justify-center rounded-lg border-2 border-[#16324f] text-sm font-bold text-[#16324f] hover:bg-[#16324f] hover:text-white">{content.annualCta}</Link></article>;
            })}
          </div>
        </section>
      </main>
      <EnglishFooter />
    </div>
  );
}
