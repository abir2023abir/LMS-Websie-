'use client';

import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  ChevronsRight,
  Clock,
  MessageCircle,
  Mic,
  Sparkles,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

type Plan = {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    id: 'speaking',
    name: 'Speaking',
    price: 29,
    tagline: 'Group practice, every week.',
    features: [
      '8 live group classes a month',
      'Real conversation, not worksheets',
      'Short questions on WhatsApp',
    ],
  },
  {
    id: 'fluency',
    name: 'Fluency',
    price: 59,
    tagline: 'The plan most learners stay on.',
    popular: true,
    features: [
      '12 live classes a month',
      '2 private sessions with a teacher',
      'Pronunciation and writing feedback',
      'Discount on any one course',
    ],
  },
  {
    id: 'ielts',
    name: 'IELTS Private',
    price: 99,
    tagline: 'For a test date that is already booked.',
    features: [
      '8 private classes a month',
      '1 full mock test',
      'Band score report',
      'Speaking and writing checked separately',
    ],
  },
];

const singles = [
  {
    id: 'mock',
    name: 'IELTS Mock Test',
    price: 25,
    time: 'One sitting',
    detail: 'Full mock, then a band score report you can keep.',
    icon: Star,
  },
  {
    id: 'interview',
    name: 'Interview English',
    price: 35,
    time: '45 minutes',
    detail: 'Job questions, your answers, and what to fix before the call.',
    icon: Mic,
  },
  {
    id: 'kids',
    name: 'Kids Phonics',
    price: 20,
    time: '40 minutes',
    detail: 'One live session for ages 4–13. Sounds, not spelling lists.',
    icon: Sparkles,
  },
];

const steps = [
  { icon: Check, title: 'Pick a plan', text: 'Monthly coaching, or a single session if you only need one.' },
  { icon: MessageCircle, title: 'We confirm', text: 'A teacher calls or messages you with the class time.' },
  { icon: Video, title: 'Class starts', text: 'Live on video. Your recorded courses stay in the dashboard.' },
];

export default function ServicesView() {
  const [selected, setSelected] = useState('fluency');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const choose = (id: string) => {
    setSelected(id);
    setSent(false);
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSent(true);
  };

  const selectedLabel =
    plans.find((p) => p.id === selected)?.name ||
    singles.find((s) => s.id === selected)?.name ||
    'Fluency';

  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <section className="relative bg-gradient-to-b from-[#FACC15] via-[#FACC15] to-[#EAB308] pt-32 lg:pt-36 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#111827] text-white rounded-full px-3.5 py-1.5 shadow-md">
              <div className="bg-[#FACC15] text-[#111827] p-1 rounded-full">
                <ChevronsRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold tracking-wide">Live coaching</span>
            </div>
            <h1 className="mt-5 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              A teacher on the call. Courses stay in your dashboard.
            </h1>
            <p className="mt-4 max-w-xl text-base sm:text-lg font-medium text-[#111827]/80">
              Monthly speaking plans, or one session when you only need a mock test, an interview, or a kids class.
            </p>
            <a
              href="#plans"
              className="mt-7 inline-flex items-center bg-[#111827] hover:bg-black text-white rounded-full pl-6 pr-1.5 py-2.5 text-sm font-bold shadow-2xl transition-all hover:scale-105"
            >
              <span>See monthly plans</span>
              <span className="ml-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-[#FACC15]" />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      <section id="plans" className="relative bg-[#111827] text-white py-20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12 text-[#EAB308]" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,80 C960,20 480,80 0,20 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-[#FACC15] rounded-full px-3.5 py-1">
              <span className="bg-[#FACC15] text-[#111827] p-1 rounded-full">
                <ChevronsRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold tracking-wide">Monthly plans</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Pay for the month. See exactly what is included.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan, idx) => (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col ${
                  plan.popular
                    ? 'order-first lg:order-none bg-gradient-to-b from-[#FEFCE8] to-[#FACC15] text-[#111827] shadow-2xl shadow-black/30 lg:-translate-y-3'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111827] text-[#FACC15] text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-extrabold text-xl">{plan.name}</h3>
                  {plan.popular ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5 text-[#FACC15]" />
                  )}
                </div>
                <p className={`mt-1 text-sm ${plan.popular ? 'text-[#111827]/75' : 'text-slate-400'}`}>
                  {plan.tagline}
                </p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display font-extrabold text-5xl leading-none">${plan.price}</span>
                  <span className={`mb-1 text-sm font-semibold ${plan.popular ? 'text-[#111827]/70' : 'text-slate-400'}`}>
                    / month
                  </span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm font-medium">
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? 'bg-[#111827] text-[#FACC15]' : 'bg-[#FACC15] text-[#111827]'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => choose(plan.id)}
                  className={`mt-7 w-full rounded-full py-3 text-sm font-extrabold transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-[#111827] text-white hover:bg-black'
                      : 'bg-[#FACC15] text-[#111827] hover:bg-[#eab308]'
                  }`}
                >
                  Get {plan.name}
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 rounded-full px-3.5 py-1">
                <span className="text-xs font-bold tracking-wide">One time</span>
              </div>
              <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                No month needed
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              Book a single sitting. Same teachers, no plan.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {singles.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-[#FEF9C3] bg-[#FEFCE8]/70 p-6 flex flex-col hover:border-[#FACC15] transition-colors"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-display font-extrabold text-lg">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 flex-1">{item.detail}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-display font-extrabold text-2xl">${item.price}</div>
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.time}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => choose(item.id)}
                      className="rounded-full bg-[#111827] text-white text-xs font-bold px-4 py-2.5 hover:bg-black"
                    >
                      Book
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#FEFCE8] py-16 border-y border-[#FEF9C3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#111827] text-[#FACC15] flex items-center justify-center font-display font-extrabold flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Step {i + 1}</div>
                  <h3 className="font-display font-extrabold text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="book" className="bg-white py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 rounded-full px-3.5 py-1">
              <span className="text-xs font-bold tracking-wide">Book</span>
            </div>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Tell us the plan. We set the time.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              You picked <span className="font-bold text-[#111827]">{selectedLabel}</span>. Leave a number that picks up. Payment is confirmed with the teacher before the first class.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-[#111827] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4"
          >
            {sent ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-2xl">Request received</h3>
                <p className="text-sm text-slate-300">
                  {selectedLabel} is noted. We will call {name} on {phone}.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-bold text-slate-300">
                    Name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1.5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15]"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-300">
                    Phone
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="mt-1.5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15]"
                      placeholder="01XXXXXXXXX"
                    />
                  </label>
                </div>
                <label className="block text-xs font-bold text-slate-300">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15]"
                    placeholder="you@email.com"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-300">
                  Plan
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FACC15]"
                  >
                    <optgroup label="Monthly">
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id} className="text-[#111827]">
                          {plan.name} — ${plan.price}/month
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="One time">
                      {singles.map((item) => (
                        <option key={item.id} value={item.id} className="text-[#111827]">
                          {item.name} — ${item.price}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <label className="block text-xs font-bold text-slate-300">
                  Note
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] resize-none"
                    placeholder="Preferred days, IELTS date, or the child's age"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-sm px-6 py-3"
                >
                  Send request
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <EnglishFooter />
    </div>
  );
}
