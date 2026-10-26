'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { defaultContactBookingContent, type ContactBookingContent } from '@/lib/contact-booking-types';

const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:opacity-60';

function calendarKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dhakaTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
}

function isWeekday(date: Date) {
  return date.getDay() !== 0 && date.getDay() !== 6;
}

function hasTimePassed(date: string, slot: string) {
  if (date !== dhakaTodayKey()) return false;
  const match = slot.match(/^(\d{1,2}):(\d{2}) (am|pm)$/);
  if (!match) return false;
  let hour = Number(match[1]) % 12;
  if (match[3] === 'pm') hour += 12;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number);
  return hour * 60 + Number(match[2]) <= parts[0] * 60 + parts[1];
}

export default function ConsultationBookingForm({ initialService = '', initialBilling = '', content = defaultContactBookingContent }: { initialService?: string; initialBilling?: string; content?: ContactBookingContent }) {
  const [todayYear, todayMonth, todayDay] = dhakaTodayKey().split('-').map(Number);
  const today = new Date(todayYear, todayMonth - 1, todayDay);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceType, setServiceType] = useState(initialService ? 'bookkeeping' : '');
  const [topic, setTopic] = useState(initialService);
  const [billing, setBilling] = useState(initialBilling);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const days = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(firstDay.getDay()).fill(null), ...Array.from({ length: dayCount }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))];
  }, [month]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/messages?availability=1&date=${encodeURIComponent(selectedDate)}`)
      .then((response) => response.json())
      .then((data) => setBookedTimes(data.bookedTimes || []))
      .catch(() => setBookedTimes([]));
  }, [selectedDate]);

  const dateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00+06:00`).toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : content.chooseDate;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDate || !selectedTime) { setFeedback(`${content.chooseDate}: ${content.chooseTime}`); setStep(1); return; }
    setSending(true);
    setFeedback('');
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const summary = [message.trim(), `Topic: ${topic}`, `Preferred consultation: ${dateLabel} at ${selectedTime} (${content.timezone})`, billing && `${content.billingLabel}: ${billing}`, company && `${content.company}: ${company}`, monthlyRevenue && `${content.revenue}: ${monthlyRevenue}`].filter(Boolean).join('\n\n');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'service', name, email, phone, text: summary, topic: `${serviceType}: ${topic}`, billing, appointmentDate: selectedDate, appointmentTime: selectedTime, company, monthlyRevenue }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not send your request.');
      setSent(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not send your request.');
    } finally {
      setSending(false);
    }
  };

  if (sent) return <section id="contact" className="bg-[#111827] px-4 py-16 text-white sm:px-6 sm:py-20"><div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 text-center text-slate-800 shadow-2xl sm:p-12"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-extrabold">{content.successTitle}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{content.successBody.replace('{date}', dateLabel).replace('{time}', selectedTime)}</p><p className="mt-3 text-xs text-slate-500">{content.noInvitationNote}</p></div></section>;

  return <section id="contact" className="relative overflow-hidden bg-[#111827] px-4 py-14 text-white sm:px-6 sm:py-20">
    <div className="relative z-10 mx-auto max-w-6xl">
      <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FACC15]">{content.eyebrow}</span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{content.headline}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{content.description}</p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-800 shadow-2xl">
        <div className="grid min-h-[460px] lg:grid-cols-[1fr_1.08fr]">
          <div className="bg-[#0f5dbb] p-5 text-white sm:p-7 lg:p-8">
            <div className="flex items-start justify-between gap-4"><div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f5dbb]"><CalendarDays className="h-5 w-5" /></div><h3 className="mt-4 font-display text-xl font-bold">{content.meetingTitle}</h3><p className="mt-1 text-sm text-blue-100">{content.calendarHint}</p></div><div className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{content.duration}</div></div>
            <div className="mt-7 flex items-center justify-between"><h4 className="font-semibold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4><div className="flex gap-2"><button type="button" aria-label="Previous month" disabled={month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear()} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-full p-2 hover:bg-white/15 disabled:opacity-30"><ChevronLeft size={18} /></button><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-full p-2 hover:bg-white/15"><ChevronRight size={18} /></button></div></div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-blue-100">{content.weekdayLabels.map((day) => <span key={day} className="py-2">{day}</span>)}</div>
            <div className="grid grid-cols-7 gap-1 text-center">{days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const key = calendarKey(day);
              const disabled = day < today || !isWeekday(day) || day > new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45);
              return <button key={key} type="button" disabled={disabled} aria-pressed={selectedDate === key} onClick={() => { setSelectedDate(key); setSelectedTime(''); }} className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${selectedDate === key ? 'bg-white font-bold text-[#0f5dbb]' : disabled ? 'cursor-not-allowed text-blue-200/40' : 'text-white hover:bg-white/20'}`}>{day.getDate()}</button>;
            })}</div>
            <div className="mt-6 space-y-2 border-t border-white/15 pt-4 text-xs text-blue-100"><div className="flex items-center gap-2"><MapPin size={15} /> {content.location}</div><div className="flex items-center gap-2"><Clock3 size={15} /> {content.timezone}</div></div>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            {step === 1 ? <>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock3 size={18} className="text-sky-600" /> {content.availableTimesLabel} <span className="font-normal text-slate-500">· {dateLabel}</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{content.pendingNote}</p>
              <div className="mt-4 grid max-h-[340px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {selectedDate ? content.availableTimes.map((slot) => {
                  const disabled = bookedTimes.includes(slot) || hasTimePassed(selectedDate, slot);
                  return <button key={slot} type="button" disabled={disabled} aria-pressed={selectedTime === slot} onClick={() => setSelectedTime(slot)} className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${selectedTime === slot ? 'border-sky-700 bg-sky-50 text-sky-800 ring-1 ring-sky-600' : disabled ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through' : 'border-slate-200 text-sky-700 hover:border-sky-600 hover:bg-sky-50'}`}>{slot}</button>;
                }) : <div className="col-span-2 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{content.chooseTime}</div>}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs text-slate-500">{selectedTime ? `${dateLabel} · ${selectedTime}` : content.chooseTime}</span><button type="button" disabled={!selectedTime} onClick={() => { setStep(2); setFeedback(''); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-40">{content.continueLabel} <ArrowRight size={16} /></button></div>
            </> : <form onSubmit={submit} className="space-y-3.5">
              <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-display text-xl font-bold">{content.informationTitle}</h3><p className="mt-1 text-xs text-slate-500">{dateLabel} · {selectedTime} · {content.timezone}</p></div><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-bold text-sky-700"><ArrowLeft size={14} /> {content.editTime}</button></div>
              <label className="block text-xs font-bold text-slate-600">{content.serviceQuestion} *<select required value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={`${fieldClass} mt-1.5`}><option value="">{content.selectTopic}</option><option value="course">{content.courseOption}</option><option value="bookkeeping">{content.bookkeepingOption}</option><option value="programme">{content.programmeOption}</option><option value="career">{content.careerOption}</option><option value="other">{content.otherOption}</option></select></label>
              <label className="block text-xs font-bold text-slate-600">{content.topicLabel} *<input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={content.topicPlaceholder} className={`${fieldClass} mt-1.5`} /></label>
              {serviceType === 'bookkeeping' && <label className="block text-xs font-bold text-slate-600">{content.billingLabel}<select value={billing} onChange={(e) => setBilling(e.target.value)} className={`${fieldClass} mt-1.5`}><option value="">{content.chooseIfKnown}</option><option value="month">{content.monthlyLabel}</option><option value="year">{content.annualLabel}</option></select></label>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">{content.firstName} *<input required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${fieldClass} mt-1.5`} /></label><label className="block text-xs font-bold text-slate-600">{content.lastName} *<input required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`${fieldClass} mt-1.5`} /></label></div>
              <label className="block text-xs font-bold text-slate-600">{content.email} *<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
              <label className="block text-xs font-bold text-slate-600">{content.phone} *<input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
              {serviceType === 'bookkeeping' && <><label className="block text-xs font-bold text-slate-600">{content.company} *<input required value={company} onChange={(e) => setCompany(e.target.value)} className={`${fieldClass} mt-1.5`} /></label><label className="block text-xs font-bold text-slate-600">{content.revenue} *<select required value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} className={`${fieldClass} mt-1.5`}><option value="">Select</option><option>Under $10,000</option><option>$10,000–$50,000</option><option>$50,000–$100,000</option><option>Over $100,000</option><option>Prefer to discuss</option></select></label></>}
              <label className="block text-xs font-bold text-slate-600">{content.discuss} *<textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${fieldClass} mt-1.5 resize-y`} /></label>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="max-w-xs text-[11px] leading-4 text-slate-500">{content.inboxNote}</p><button disabled={sending} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-50">{sending ? content.sendingLabel : content.confirmLabel} <ArrowRight size={16} /></button></div>
            </form>}
            {feedback && <p role="alert" className="mt-3 text-sm font-semibold text-rose-600">{feedback}</p>}
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-4xl text-center text-[11px] text-slate-400">{content.integrationNote}</p>
    </div>
  </section>;
}
