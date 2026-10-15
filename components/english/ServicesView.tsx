import Link from 'next/link';
import { Check } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import {
  money,
  monthlyPlans,
  singleSessions,
  yearlyFull,
  yearlySale,
  type ServiceOffer,
} from '@/lib/service-catalog';

function GetStarted({ href, popular = false }: { href: string; popular?: boolean }) {
  return (
    <Link
      href={href}
      className={`mt-6 flex items-center justify-center rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
        popular
          ? 'border-[#1c6b57] text-[#16324f] hover:bg-[#1c6b57] hover:text-white'
          : 'border-[#16324f] text-[#16324f] hover:bg-[#16324f] hover:text-white'
      }`}
    >
      Get started
    </Link>
  );
}

function Included({ features }: { features: string[] }) {
  return (
    <div className="mt-6">
      <div className="text-sm font-bold text-[#16324f]">What&apos;s included</div>
      <ul className="mt-3 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#3d4d5c] leading-snug">
            <Check className="w-4 h-4 mt-0.5 text-[#1f9d55] flex-shrink-0" strokeWidth={2.5} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthlyCard({ plan }: { plan: ServiceOffer }) {
  return (
    <article
      className={`relative flex h-full flex-col bg-white rounded-2xl px-6 py-7 sm:px-7 ${
        plan.popular
          ? 'border-2 border-[#2f9d78] shadow-sm'
          : 'border border-[#e4ebf1]'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2f9d78] text-white text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full">
          Most popular
        </div>
      )}
      <h2 className="font-display font-bold text-xl text-[#16324f]">{plan.name}</h2>
      <p className="mt-1 text-sm text-[#6b7c8a] leading-relaxed">{plan.tagline}</p>
      <div className="mt-8 font-display font-bold text-[#16324f] text-[2.6rem] leading-none tracking-tight">
        {money(plan.price)}
        <span className="text-lg font-semibold text-[#16324f]">/mo</span>
      </div>
      <GetStarted href={`/services/apply/${plan.id}?billing=month`} popular={plan.popular} />
      <Included features={plan.features} />
    </article>
  );
}

function YearlyCard({ plan }: { plan: ServiceOffer }) {
  return (
    <article className="flex h-full flex-col bg-white rounded-2xl border border-[#e4ebf1] px-6 py-7 sm:px-7">
      <h2 className="font-display font-bold text-xl text-[#16324f]">{plan.name}</h2>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-slate-400 line-through text-base">{money(yearlyFull(plan.price))}</span>
        <span className="font-display font-bold text-[#16324f] text-[2rem] leading-none">
          {money(yearlySale(plan.price))}
          <span className="text-lg">/yr</span>
        </span>
      </div>
      <div className="mt-2 text-sm font-semibold text-[#1f9d55]">20% off a 12-month plan</div>
      <GetStarted href={`/services/apply/${plan.id}?billing=year`} />
    </article>
  );
}

export default function ServicesView() {
  return (
    <div className="min-h-screen bg-[#eef3f6] text-[#16324f] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {monthlyPlans.map((plan) => (
            <MonthlyCard key={plan.id} plan={plan} />
          ))}
        </div>

        <h2 className="mt-14 text-center font-display font-bold text-xl sm:text-2xl text-[#16324f]">
          Prefer to pay for the year? Save 20%.
        </h2>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {monthlyPlans.map((plan) => (
            <YearlyCard key={plan.id} plan={plan} />
          ))}
        </div>

        <h2 className="mt-14 text-center font-display font-bold text-xl text-[#16324f]">
          Or book one session
        </h2>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {singleSessions.map((item) => (
            <article key={item.id} className="flex h-full flex-col bg-white rounded-2xl border border-[#e4ebf1] px-6 py-7">
              <h3 className="font-display font-bold text-xl text-[#16324f]">{item.name}</h3>
              <p className="mt-1 text-sm text-[#6b7c8a]">{item.tagline}</p>
              <div className="mt-6 font-display font-bold text-3xl text-[#16324f]">
                {money(item.price)}
                <span className="text-sm font-semibold text-[#6b7c8a] ml-2">{item.time}</span>
              </div>
              <GetStarted href={`/services/apply/${item.id}`} />
            </article>
          ))}
        </div>
      </main>

      <EnglishFooter />
    </div>
  );
}
