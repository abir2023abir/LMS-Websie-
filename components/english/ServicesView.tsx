import Link from 'next/link';
import { ArrowRight, Check, ChevronsRight, Clock } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { monthlyPlans, singleSessions, priceLabel } from '@/lib/service-catalog';

export default function ServicesView() {
  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-28 lg:pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 shadow-md">
              <span className="bg-[#FACC15] text-[#111827] p-1 rounded-full">
                <ChevronsRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold tracking-wide">Live coaching</span>
            </div>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl leading-[1.05] tracking-tight">
              Pick a plan. A teacher takes it from there.
            </h1>
            <p className="mt-3 max-w-lg text-base font-medium text-[#111827]/80">
              Courses stay in your dashboard. These are live classes, billed by the month or booked once.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            {monthlyPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/services/apply/${plan.id}`}
                className={`rounded-2xl px-3 py-3 text-center ${
                  plan.popular ? 'bg-[#111827] text-white' : 'bg-white/50 border border-black/10'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{plan.name}</div>
                <div className="font-display font-extrabold text-xl">${plan.price}</div>
                <div className="text-[10px] font-semibold opacity-70">/ month</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="bg-[#111827] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-center">
            Monthly plans
          </h2>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {monthlyPlans.map((plan) => (
              <article
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col ${
                  plan.popular
                    ? 'bg-[#FACC15] text-[#111827] lg:-translate-y-2'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 bg-[#111827] text-[#FACC15] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <h3 className="font-display font-extrabold text-2xl">{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.popular ? 'text-[#111827]/70' : 'text-slate-400'}`}>{plan.tagline}</p>
                <div className="mt-4 font-display font-extrabold text-5xl leading-none">
                  ${plan.price}
                  <span className="text-sm font-semibold ml-1">/ month</span>
                </div>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm font-medium">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? '' : 'text-[#FACC15]'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/apply/${plan.id}`}
                  className={`mt-6 inline-flex items-center justify-center rounded-full py-3 text-sm font-extrabold ${
                    plan.popular ? 'bg-[#111827] text-white hover:bg-black' : 'bg-[#FACC15] text-[#111827] hover:bg-[#eab308]'
                  }`}
                >
                  Get {plan.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-3xl tracking-tight">One session, no month</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {singleSessions.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-200 p-5 flex flex-col">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {item.time}
                </div>
                <h3 className="mt-2 font-display font-extrabold text-xl">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-600 flex-1">{item.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-display font-extrabold text-2xl">{priceLabel(item)}</div>
                  <Link
                    href={`/services/apply/${item.id}`}
                    className="rounded-full bg-[#111827] text-white text-xs font-bold px-4 py-2.5 hover:bg-black"
                  >
                    Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <EnglishFooter />
    </div>
  );
}
