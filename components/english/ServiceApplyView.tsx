'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import { priceLabel, type Billing, type ServiceOffer } from '@/lib/service-catalog';

export default function ServiceApplyView({ offer, billing }: { offer: ServiceOffer; billing: Billing }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: offer.id,
          billing,
          name,
          phone,
          email,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Could not send. Try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Could not send. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#111827]">
          <ArrowLeft className="w-3.5 h-3.5" /> All services
        </Link>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-5 bg-[#111827] text-white rounded-3xl p-6 sm:p-8">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#FACC15]">Selected service</div>
            <h1 className="mt-2 font-display font-extrabold text-3xl">{offer.name}</h1>
            <p className="mt-2 text-sm text-slate-300">{offer.tagline}</p>
            <div className="mt-5 font-display font-extrabold text-4xl">{priceLabel(offer, billing)}</div>
            {billing === 'year' && (
              <p className="mt-1 text-xs text-[#FACC15] font-semibold">12 months, 20% off</p>
            )}
            <ul className="mt-6 space-y-2.5">
              {offer.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-[#FACC15] flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </aside>

          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FACC15] text-[#111827] flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h2 className="mt-4 font-display font-extrabold text-2xl">Request sent</h2>
                <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                  {offer.name} is booked under {name}. We will call {phone}.
                </p>
                <Link href="/services" className="mt-6 inline-flex rounded-full bg-[#111827] text-white text-sm font-bold px-5 py-2.5">
                  Back to services
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl">Your details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    This request is for <span className="font-bold text-[#111827]">{offer.name}</span>. That does not change on this page.
                  </p>
                </div>

                <label className="block text-xs font-bold text-slate-600">
                  Name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-[#FACC15]"
                    placeholder="Your name"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-bold text-slate-600">
                    Phone
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-[#FACC15]"
                      placeholder="01XXXXXXXXX"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    Email
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-[#FACC15]"
                      placeholder="you@email.com"
                    />
                  </label>
                </div>

                <label className="block text-xs font-bold text-slate-600">
                  What do you want to know?
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-[#FACC15] resize-none"
                    placeholder="Class days, your level, an IELTS date, or a child's age"
                  />
                </label>

                {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-[#FACC15] hover:bg-[#eab308] disabled:opacity-60 text-[#111827] font-extrabold text-sm px-6 py-3"
                >
                  {sending ? 'Sending…' : `Send ${offer.name} request`}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <EnglishFooter />
    </div>
  );
}
