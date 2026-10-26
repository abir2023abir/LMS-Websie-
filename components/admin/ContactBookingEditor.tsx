'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { defaultContactBookingContent, type ContactBookingContent } from '@/lib/contact-booking-types';

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]';
const label = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';
const arrayFields = new Set<keyof ContactBookingContent>(['availableTimes', 'weekdayLabels']);

export default function ContactBookingEditor() {
  const [content, setContent] = useState(defaultContactBookingContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch('/api/admin/cms/contact-booking').then(async (response) => {
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not load settings');
      if (result.content) setContent(result.content);
    }).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cms/contact-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save settings');
      setContent(result.content); toast.success('Contact & booking settings saved.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save settings'); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="py-12 text-center text-slate-500">Loading Contact & Booking settings…</div>;

  const field = (key: keyof ContactBookingContent, title: string, multiline = false) => {
    const value = content[key];
    return <label key={key} className={multiline ? 'sm:col-span-2' : ''}><span className={label}>{title}</span>{multiline
      ? <textarea rows={3} className={input} value={(value as string[]).join('\n')} onChange={(e) => setContent((current) => ({ ...current, [key]: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) }))} />
      : <input className={input} value={value as string} onChange={(e) => setContent((current) => ({ ...current, [key]: e.target.value }))} />}</label>;
  };
  const textFields = Object.keys(defaultContactBookingContent).filter((key) => !arrayFields.has(key as keyof ContactBookingContent)) as (keyof ContactBookingContent)[];
  const titles: Record<string, string> = {
    eyebrow:'Section eyebrow', headline:'Headline', description:'Description', meetingTitle:'Calendar title', calendarHint:'Calendar hint', duration:'Meeting duration label', location:'Meeting location', timezone:'Timezone label',
    availableTimesLabel:'Available times heading', pendingNote:'Availability note', chooseDate:'Date prompt', chooseTime:'No date selected text', continueLabel:'Continue button', informationTitle:'Form heading', editTime:'Edit time button',
    serviceQuestion:'Service question', selectTopic:'Service dropdown placeholder', courseOption:'Course/lesson option', bookkeepingOption:'Bookkeeping option', programmeOption:'Programme option', careerOption:'Career option', otherOption:'Other option',
    topicLabel:'Course/service field label', topicPlaceholder:'Course/service placeholder', billingLabel:'Billing field label', chooseIfKnown:'Billing placeholder', monthlyLabel:'Monthly billing option', annualLabel:'Annual billing option',
    firstName:'First name label', lastName:'Last name label', email:'Email label', phone:'Phone label', company:'Company label', revenue:'Revenue label', discuss:'Message field label', inboxNote:'Admin inbox note', confirmLabel:'Submit button', sendingLabel:'Submitting button',
    successTitle:'Success heading', successBody:'Success message (use {date} and {time})', noInvitationNote:'No invitation note', integrationNote:'Integration note',
  };
  return <div className="space-y-7">
    <div><h3 className="text-lg font-bold text-slate-900">Contact & booking form</h3><p className="mt-1 text-sm text-slate-500">Edit the public contact form copy, appointment details, and available booking times.</p></div>
    <section className="grid gap-4 sm:grid-cols-2">{textFields.map((key) => field(key, titles[key] || key, key === 'description' || key === 'pendingNote' || key === 'inboxNote' || key === 'successBody' || key === 'integrationNote'))}</section>
    <section className="grid gap-4 sm:grid-cols-2">
      {field('availableTimes', 'Available time slots (one per line)', true)}
      {field('weekdayLabels', 'Calendar weekday labels (7, one per line)', true)}
    </section>
    <div className="sticky bottom-3 flex justify-end"><button type="button" onClick={save} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"><Save size={16} /> {saving ? 'Saving…' : 'Save Contact & Booking'}</button></div>
  </div>;
}
