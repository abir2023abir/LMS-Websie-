'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const items = [
  { q: 'What does the bookkeeping service cover?', a: 'We record sales, purchases, and expenses, reconcile bank and mobile-banking activity, and prepare the monthly reports included in your plan. Tax return work is only included when that plan says so.' },
  { q: 'Can you catch up books that are behind?', a: 'Yes. Tell us how many months are outstanding in the consultation. We agree the catch-up period, the documents we need, and a timeline before work starts.' },
  { q: 'Which documents should I share?', a: 'Bank and mobile-banking statements, sales invoices, supplier bills, payroll records if you have staff, and any prior reports. We confirm the exact list after the introduction call.' },
  { q: 'How is pricing decided?', a: 'Pricing depends on transaction volume, how current the books are, and whether you need reporting or tax support. Plans on this page show the service. A quoted price follows the consultation.' },
  { q: 'Is my financial information confidential?', a: 'Yes. Your records are used only to do the bookkeeping you asked for. They are not shared outside the team working on your account.' },
  { q: 'How do we stay in touch?', a: 'You can write by email or WhatsApp and talk by phone. Monthly reports are reviewed with you so questions are answered in the same thread of work.' },
];

export default function BookkeepingFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-extrabold tracking-[0.16em] text-slate-500">FAQ</p>
      <h2 className="mt-2 font-display text-3xl font-extrabold text-[#111827]">Common bookkeeping questions</h2>
      <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {items.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={item.q}>
              <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-[#111827]">
                {item.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
