'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { defaultContactBookingContent, type ContactBookingContent } from '@/lib/contact-booking-types';

const input = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]';
const label = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

type TextKey = { [K in keyof ContactBookingContent]: ContactBookingContent[K] extends string ? K : never }[keyof ContactBookingContent];
type Field = [TextKey, string, ('long' | undefined)?];

// Fields grouped the way they appear on the contact page.
const groups: { title: string; hint: string; open: boolean; fields: Field[] }[] = [
  {
    title: 'Section heading', hint: 'The title above the booking calendar.', open: true,
    fields: [['eyebrow', 'Small label above the title'], ['headline', 'Headline'], ['description', 'Description', 'long']],
  },
  {
    title: 'Meeting details', hint: 'Shown on the blue calendar card.', open: true,
    fields: [['meetingTitle', 'Meeting title'], ['calendarHint', 'Calendar hint'], ['duration', 'Duration'], ['location', 'Meeting location'], ['timezone', 'Timezone']],
  },
  {
    title: 'Choosing a time', hint: 'Text beside the list of time slots.', open: false,
    fields: [['availableTimesLabel', 'Times heading'], ['chooseDate', 'Date prompt'], ['chooseTime', 'Text before a date is chosen'], ['continueLabel', 'Continue button'], ['pendingNote', 'Note under the times', 'long']],
  },
  {
    title: 'Booking form', hint: 'Labels on the form visitors fill in.', open: false,
    fields: [
      ['informationTitle', 'Form heading'], ['editTime', 'Edit time button'], ['serviceQuestion', 'Service question'], ['selectTopic', 'Service dropdown placeholder'],
      ['courseOption', 'Option: course question'], ['bookkeepingOption', 'Option: bookkeeping'], ['programmeOption', 'Option: programme'], ['careerOption', 'Option: career guidance'], ['otherOption', 'Option: something else'],
      ['topicLabel', 'Course / service field'], ['topicPlaceholder', 'Course / service placeholder'], ['billingLabel', 'Billing field'], ['chooseIfKnown', 'Billing placeholder'],
      ['monthlyLabel', 'Monthly option'], ['annualLabel', 'Annual option'], ['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Email'], ['phone', 'Phone'],
      ['company', 'Company'], ['revenue', 'Monthly revenue'], ['discuss', 'Message field'], ['confirmLabel', 'Submit button'], ['sendingLabel', 'Submitting text'], ['inboxNote', 'Note under the form', 'long'],
    ],
  },
  {
    title: 'After booking', hint: 'What visitors see once they send a request.', open: false,
    fields: [['successTitle', 'Success heading'], ['successBody', 'Success message — {date} and {time} are filled in automatically', 'long'], ['noInvitationNote', 'Follow-up note']],
  },
];

export default function ContactBookingEditor() {
  const [content, setContent] = useState(defaultContactBookingContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cms/contact-booking').then(async (response) => {
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not load settings');
      if (result.content) setContent({ ...defaultContactBookingContent, ...result.content });
    }).catch((error: Error) => toast.error(error.message)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/cms/contact-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save settings');
      setContent({ ...defaultContactBookingContent, ...result.content }); toast.success('Contact & booking settings saved.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading Contact & Booking settings…</div>;

  const setText = (key: TextKey, value: string) => setContent((current) => ({ ...current, [key]: value }));
  const listText = (key: 'availableTimes' | 'weekdayLabels') => (Array.isArray(content[key]) ? content[key] : []).join('\n');
  const setList = (key: 'availableTimes' | 'weekdayLabels', value: string) =>
    setContent((current) => ({ ...current, [key]: value.split('\n').map((line) => line.trim()).filter(Boolean) }));

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <div>
          <h3 className="font-bold text-slate-900">Time slots</h3>
          <p className="text-xs text-slate-500">The times visitors can pick. Write one per line, e.g. <code className="rounded bg-slate-100 px-1">10:00 am</code>.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={label}>Available time slots</span><textarea rows={6} className={input} value={listText('availableTimes')} onChange={(e) => setList('availableTimes', e.target.value)} /></label>
          <label><span className={label}>Weekday names (Sunday first, 7 lines)</span><textarea rows={6} className={input} value={listText('weekdayLabels')} onChange={(e) => setList('weekdayLabels', e.target.value)} /></label>
        </div>
      </section>

      {groups.map((group) => (
        <details key={group.title} open={group.open} className="group rounded-2xl border border-slate-200">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span>
              <span className="block font-bold text-slate-900">{group.title}</span>
              <span className="block text-xs text-slate-500">{group.hint}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-2">
            {group.fields.map(([key, title, size]) => (
              <label key={key} className={size === 'long' ? 'sm:col-span-2' : ''}>
                <span className={label}>{title}</span>
                {size === 'long'
                  ? <textarea rows={3} className={input} value={String(content[key] ?? '')} onChange={(e) => setText(key, e.target.value)} />
                  : <input className={input} value={String(content[key] ?? '')} onChange={(e) => setText(key, e.target.value)} />}
              </label>
            ))}
          </div>
        </details>
      ))}

      <div className="sticky bottom-3 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60"><Save size={16} /> {saving ? 'Saving…' : 'Save Contact & Booking'}</button>
      </div>
    </div>
  );
}
