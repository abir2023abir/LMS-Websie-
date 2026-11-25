'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import type { CourseSchema } from '@/types/course';
import { X, ShieldCheck, CheckCircle, AlertCircle, Lock, ArrowRight, Copy, Clock } from 'lucide-react';
import EnrollmentFields, { Field, inputClass, Section } from '@/components/checkout/EnrollmentFields';
import { emptyDetails, type EnrollmentDetails } from '@/lib/enrollment-form-fields';
import { BkashMark, CardMark, NagadMark, RocketMark, SslMark } from '@/components/checkout/PayMarks';
import { taka } from '@/lib/utils';

interface CheckoutModalProps {
  course: CourseSchema;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ManualMethod = { id: 'bkash' | 'nagad' | 'rocket'; label: string; number: string; accountType: string };
type Methods = { ssl: boolean; manual: ManualMethod[]; manualInstructions: string; price: { amount: number; title: string } | null };

const manualMark = { bkash: <BkashMark />, nagad: <NagadMark />, rocket: <RocketMark /> };

export default function CheckoutModal({ course, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const router = useRouter();
  const { user, role } = useAuth();

  const [methods, setMethods] = useState<Methods | null>(null);
  const [details, setDetails] = useState<EnrollmentDetails>(emptyDetails);
  const [senderNumber, setSenderNumber] = useState('');
  // The form was saved but the payment still has to be sent or arranged.
  const [formSaved, setFormSaved] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [freeEnrolled, setFreeEnrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/payment/methods?courseId=${encodeURIComponent(String(course.id || ''))}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: Methods) => setMethods(data))
      .catch(() => setError('Could not load payment options. Please try again.'));
  }, [isOpen, course.id]);

  // Fill the form with what the student sent before, else with their account details.
  const isStudent = Boolean(user) && role === 'Student';
  useEffect(() => {
    if (!isOpen || !isStudent) return;
    fetch(`/api/student/enrollment-form?courseId=${encodeURIComponent(String(course.id || ''))}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success) return;
        const saved = data.saved || {};
        setDetails((prev) => ({
          ...prev,
          ...saved,
          fullName: prev.fullName || saved.fullName || data.account.name,
          email: prev.email || saved.email || data.account.email,
          phone: prev.phone || saved.phone || data.account.phone,
        }));
      })
      .catch(() => undefined);
  }, [isOpen, isStudent, course.id]);

  if (!isOpen) return null;

  const amount = methods?.price?.amount ?? 0;
  const paid = amount > 0;
  const noMethods = Boolean(methods && !methods.ssl && methods.manual.length === 0);
  const choice = details.paymentMethod;
  const manual = methods?.manual.find((item) => item.id === choice) || null;
  const change = (patch: Partial<EnrollmentDetails>) => { setDetails((prev) => ({ ...prev, ...patch })); setFormSaved(false); };

  const post = async (url: string, init: RequestInit, fallback: string) => {
    const res = await fetch(url, { method: 'POST', ...init });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || fallback);
    return data;
  };
  const json = (body: unknown): RequestInit => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  // Saves the form, then opens the course (free) or takes the payment. A paid course opens only
  // after the payment is verified by the gateway or approved by the admin.
  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const sent = { ...details, paymentMethod: noMethods ? 'arrange' : details.paymentMethod };
      await post('/api/student/enrollment-form', json({ courseId: course.id, details: sent }), 'Could not save the form.');
      if (!paid) {
        await post('/api/student/enrollments/free', json({ courseId: course.id }), 'Could not enroll in this course.');
        setFreeEnrolled(true);
        onSuccess?.();
      } else if (choice === 'ssl') {
        const data = await post('/api/payment/init', json({ courseId: course.id }), 'Could not start the payment.');
        if (!data.url) throw new Error('Could not start the payment.');
        window.location.href = data.url;
        return;
      } else if (manual && details.paymentReference.trim()) {
        const form = new FormData();
        form.set('courseId', String(course.id || ''));
        form.set('method', manual.id);
        form.set('senderNumber', senderNumber || details.phone);
        form.set('transactionId', details.paymentReference);
        if (screenshot) form.set('screenshot', screenshot);
        await post('/api/payment/manual', { body: form }, 'Could not submit the payment.');
        setSubmitted(true);
        onSuccess?.();
      } else {
        setFormSaved(true);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the form.');
      setLoading(false);
    }
  };

  const copyNumber = async () => {
    if (!manual) return;
    try { await navigator.clipboard.writeText(manual.number); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title" className="glass rounded-2xl sm:rounded-3xl border border-white/10 w-full max-w-xl my-2 sm:my-8 p-4 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 min-h-11 min-w-11 flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 id="checkout-modal-title" className="font-display font-bold text-2xl text-white">Course Enrollment</h2>
            <p className="text-xs text-slate-400">কোর্সে Enroll করার জন্য আপনার প্রয়োজনীয় তথ্য পূরণ করুন।</p>
          </div>
        </div>

        {freeEnrolled ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">You’re enrolled</h3>
            <p className="text-sm text-slate-300">Your free course is ready in your student classroom.</p>
            <Button variant="primary" size="lg" onClick={() => router.push(`/student/learn/${encodeURIComponent(String(course.id || ''))}`)}>Go to classroom</Button>
          </div>
        ) : submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">Payment submitted</h3>
            <p className="text-sm text-slate-300">We&apos;ll check your {manual?.label} payment and open the course for you — usually within a few hours.</p>
            <p className="text-xs text-slate-400">You can see the status on your Student Dashboard.</p>
            <Button variant="primary" size="lg" onClick={() => router.push('/student')}>Go to my dashboard</Button>
          </div>
        ) : !user || role !== 'Student' ? (
          <div className="space-y-4 rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/10 p-5 text-center">
            <p className="font-semibold text-white">{methods?.price?.amount === 0 ? 'Create or sign in to a student account to enroll in this free course.' : 'Create or sign in to a student account before enrolling.'}</p>
            <p className="text-xs leading-relaxed text-slate-300">{methods?.price?.amount === 0 ? 'No payment is required. Sign in or create an account to add the course to your classroom.' : 'Your full name, email, and phone number are required for student registration.'}</p>
            <Link
              href={`/signup?next=${encodeURIComponent(`/checkout/${course.id || ''}`)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-extrabold text-[#111827] hover:bg-[#eab308]"
            >
              Create student account
            </Link>
            <Link href={`/login?next=${encodeURIComponent(`/checkout/${course.id || ''}`)}`} className="block text-xs font-semibold text-slate-200 underline underline-offset-4">
              Already registered? Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Course summary — the amount comes from the server */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/8">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0 border border-white/10">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm line-clamp-2">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instructor: {course.instructorName || 'Career Bridge.Studio Team'}</p>
                <div className="mt-1 font-bold text-white text-sm">{methods ? (methods.price ? (paid ? taka(amount) : 'Free') : 'Not available') : 'Loading…'}</div>
              </div>
            </div>

            {!methods ? (
              <p className="text-center text-sm text-slate-400">{error || 'Loading the form…'}</p>
            ) : !methods.price ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">This course isn&apos;t open for enrollment right now.</p>
            ) : (
              <form onSubmit={submitForm} className="space-y-4">
                <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                  {paid ? 'Payment confirm হলে এই course-এ আপনার access automatically activate হবে।' : 'Form submit করার পর এই course-এ আপনার access automatically activate হবে।'}
                </p>

                <EnrollmentFields value={details} onChange={change} />

                {paid && (noMethods ? (
                  <p className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">Online payment opens soon. Send the form and we will contact you to complete the payment.</p>
                ) : (
                  <Section title="💳 Payment Method">
                    <Field label="Preferred Payment Method" required>
                      <select required value={details.paymentMethod} onChange={(e) => change({ paymentMethod: e.target.value })} className={inputClass}>
                        <option value="">Select method</option>
                        {methods.ssl && <option value="ssl">Pay online — card, bKash, Nagad, Rocket (instant access)</option>}
                        {methods.manual.map((item) => <option key={item.id} value={item.id}>{item.label} Send Money</option>)}
                      </select>
                    </Field>
                    {choice !== 'ssl' && (
                      <Field label="Payment Reference / Transaction ID">
                        <input value={details.paymentReference} onChange={(e) => change({ paymentReference: e.target.value })} placeholder="Optional" maxLength={20} pattern="[A-Za-z0-9]{6,20}" title="6 to 20 letters and numbers" className={`${inputClass} font-mono uppercase`} />
                      </Field>
                    )}
                    {choice === 'ssl' && <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2"><SslMark /><BkashMark /><NagadMark /><CardMark /></div>}
                    {manual && (
                      <div className="space-y-3 sm:col-span-2">
                        <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">{manualMark[manual.id]}<span>{methods.manualInstructions}</span></p>
                        <div className="flex items-center justify-between gap-3 rounded-xl bg-black/30 px-4 py-3">
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">{manual.label} {manual.accountType} number</div>
                            <div className="font-mono text-lg font-bold text-white">{manual.number}</div>
                          </div>
                          <button type="button" onClick={copyNumber} className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10">
                            <Copy className="h-3.5 w-3.5" />{copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="text-xs text-slate-300">Amount to send: <strong className="text-white">{taka(amount)}</strong></div>
                        {details.paymentReference.trim() !== '' && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Your sender number">
                              <input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} inputMode="tel" placeholder={details.phone || '01XXXXXXXXX'} className={inputClass} />
                            </Field>
                            <Field label="Payment screenshot (optional)">
                              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
                            </Field>
                          </div>
                        )}
                      </div>
                    )}
                  </Section>
                ))}

                <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-200">
                  <input type="checkbox" required checked={details.consent} onChange={(e) => change({ consent: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#FACC15]" />
                  <span>আমি প্রদত্ত তথ্য সঠিক বলে নিশ্চিত করছি এবং Course Enrollment-এর জন্য এই তথ্য ব্যবহারের সম্মতি দিচ্ছি।</span>
                </label>

                {error && (
                  <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {formSaved && (
                  <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                    {noMethods ? 'Your form is received. We will contact you to complete the payment.' : `Your form is saved. Send ${taka(amount)}, then write the Transaction ID above and press Submit again to get access.`}
                  </p>
                )}

                {paid && <div className="flex justify-between border-t border-white/10 pt-4 font-display text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-primary-300">{taka(amount)}</span>
                </div>}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button type="button" onClick={onClose} className="min-h-12 rounded-xl border border-white/15 px-6 text-sm font-bold text-slate-200 hover:bg-white/10">Cancel</button>
                  <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} leftIcon={choice === 'ssl' ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Submit &amp; Enroll Now
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
