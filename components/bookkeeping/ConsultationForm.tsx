'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';

const businessTypes = ['Retail/Wholesale', 'Professional Services', 'Online Business', 'Consulting', 'Agency', 'Restaurant/Café', 'Real Estate', 'Other'];
const services = ['Ongoing Bookkeeping', 'Catch-Up Bookkeeping', 'Financial Reporting', 'Consultation'];
const times = ['9:15 am', '9:30 am', '10:00 am', '10:30 am', '1:00 pm', '1:30 pm', '2:00 pm', '3:00 pm', '4:00 pm'];
const field = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-[#111827] focus:bg-white';

export default function ConsultationForm({ presetService = '' }: { presetService?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const first = String(data.get('firstName') || '').trim();
    const last = String(data.get('lastName') || '').trim();
    const service = String(data.get('service') || '');
    const notes = String(data.get('notes') || '').trim();
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'service',
          name: `${first} ${last}`.trim(),
          email: data.get('email'),
          phone: data.get('phone'),
          topic: service,
          company: data.get('business'),
          appointmentDate: data.get('date'),
          appointmentTime: data.get('time'),
          text: [`Business type: ${data.get('businessType')}`, `Service: ${service}`, notes].filter(Boolean).join('\n'),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.message || 'Could not send the request.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="consultation" className="scroll-mt-28 bg-[#111827] px-4 py-16 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#FACC15]">CONSULTATION</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Book a consultation</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">Tell us about the business and a time that suits you. The request lands in the admin message inbox so the team can confirm it.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 text-[#111827] sm:p-7">
          {sent ? (
            <div className="flex items-start gap-3 py-8">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-display text-xl font-bold">Request received</h3>
                <p className="mt-1 text-sm text-slate-600">We saved your preferred time. The team will confirm it from the message inbox.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-600">First Name *<input name="firstName" required autoComplete="given-name" className={field} /></label>
              <label className="text-xs font-bold text-slate-600">Last Name *<input name="lastName" required autoComplete="family-name" className={field} /></label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Email Address *<input name="email" type="email" required autoComplete="email" className={field} /></label>
              <label className="text-xs font-bold text-slate-600">Phone Number <span className="font-medium text-slate-400">(optional)</span><input name="phone" type="tel" autoComplete="tel" className={field} /></label>
              <label className="text-xs font-bold text-slate-600">Business Name<input name="business" className={field} /></label>
              <label className="text-xs font-bold text-slate-600">Business Type
                <select name="businessType" defaultValue="" className={field}><option value="">Select</option>{businessTypes.map((type) => <option key={type}>{type}</option>)}</select>
              </label>
              <label className="text-xs font-bold text-slate-600">Required Service
                <select name="service" defaultValue={presetService} className={field}>{services.map((service) => <option key={service}>{service}</option>)}</select>
              </label>
              <label className="text-xs font-bold text-slate-600">Preferred Meeting Date *<input name="date" type="date" required className={field} /></label>
              <label className="text-xs font-bold text-slate-600">Available Meeting Time *
                <select name="time" required defaultValue="" className={field}><option value="" disabled>Select a time</option>{times.map((time) => <option key={time}>{time}</option>)}</select>
              </label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Additional Notes<textarea name="notes" rows={4} className={`${field} resize-y`} /></label>
              {error && <p className="text-sm font-semibold text-rose-600 sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FACC15] px-6 text-sm font-extrabold text-[#111827] hover:bg-[#EAB308] disabled:opacity-60">{sending ? 'Sending…' : 'Request a Consultation'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
