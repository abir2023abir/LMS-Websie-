'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import type { CourseSchema } from '@/types/course';
import { X, ShieldCheck, CheckCircle, AlertCircle, Lock, ArrowRight, Copy, Clock } from 'lucide-react';
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
  const [choice, setChoice] = useState<'ssl' | ManualMethod['id'] | ''>('');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/payment/methods?courseId=${encodeURIComponent(String(course.id || ''))}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: Methods) => {
        setMethods(data);
        setChoice(data.ssl ? 'ssl' : data.manual[0]?.id || '');
      })
      .catch(() => setError('Could not load payment options. Please try again.'));
  }, [isOpen, course.id]);

  if (!isOpen) return null;

  const amount = methods?.price?.amount ?? 0;
  const manual = methods?.manual.find((item) => item.id === choice) || null;
  const noMethods = methods && !methods.ssl && methods.manual.length === 0;

  const payOnline = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/payment/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: course.id }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message || 'Could not start the payment.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment.');
      setLoading(false);
    }
  };

  const submitManual = async () => {
    if (!manual) return;
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.set('courseId', String(course.id || ''));
      form.set('method', manual.id);
      form.set('senderNumber', senderNumber);
      form.set('transactionId', transactionId);
      if (screenshot) form.set('screenshot', screenshot);
      const res = await fetch('/api/payment/manual', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not submit the payment.');
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the payment.');
    } finally {
      setLoading(false);
    }
  };

  const copyNumber = async () => {
    if (!manual) return;
    try { await navigator.clipboard.writeText(manual.number); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="glass rounded-2xl sm:rounded-3xl border border-white/10 w-full max-w-xl my-2 sm:my-8 p-4 sm:p-8 shadow-2xl relative">
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
            <h2 className="font-display font-bold text-2xl text-white">Checkout & Enroll</h2>
            <p className="text-xs text-slate-400">Secure payment · Course opens after payment is confirmed</p>
          </div>
        </div>

        {submitted ? (
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
            <p className="font-semibold text-white">Create or sign in to a student account before enrolling.</p>
            <p className="text-xs leading-relaxed text-slate-300">Your full name, email, and phone number are required for student registration.</p>
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
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Course summary — the amount comes from the server */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/8">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0 border border-white/10">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instructor: {course.instructorName || 'Career Bridge.Studio Team'}</p>
                <div className="mt-1 font-bold text-white text-sm">{methods ? (methods.price ? taka(amount) : 'Not available') : 'Loading…'}</div>
              </div>
            </div>

            {!methods ? (
              <p className="text-center text-sm text-slate-400">Loading payment options…</p>
            ) : !methods.price ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">This course isn&apos;t open for enrollment right now.</p>
            ) : noMethods ? (
              <p className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">Online enrollment opens soon. Please contact us to enroll in this course.</p>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {methods.ssl && (
                      <button type="button" onClick={() => setChoice('ssl')} className={`col-span-2 p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${choice === 'ssl' ? 'bg-white/10 border-[#FACC15] text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                        <span className="flex flex-wrap items-center justify-center gap-1.5"><SslMark /><BkashMark /><NagadMark /><CardMark /></span>
                        <span>Pay online — card, bKash, Nagad, Rocket (instant access)</span>
                      </button>
                    )}
                    {methods.manual.map((item) => (
                      <button key={item.id} type="button" onClick={() => setChoice(item.id)} className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${choice === item.id ? 'bg-white/10 border-[#FACC15] text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                        {manualMark[item.id]}
                        <span>{item.label} Send Money</span>
                      </button>
                    ))}
                  </div>
                </div>

                {manual && (
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs leading-relaxed text-slate-300">{methods.manualInstructions}</p>
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
                    <input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} inputMode="tel" placeholder="Your sender number (01XXXXXXXXX)" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#FACC15] focus:outline-none" />
                    <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Transaction ID (TrxID)" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm uppercase text-white placeholder-slate-500 focus:border-[#FACC15] focus:outline-none" />
                    <label className="block text-xs text-slate-400">
                      Payment screenshot (optional)
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} className="mt-1 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
                    </label>
                  </div>
                )}

                <div className="flex justify-between border-t border-white/10 pt-4 font-display text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-primary-300">{taka(amount)}</span>
                </div>

                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  isLoading={loading}
                  disabled={choice !== 'ssl' && (!senderNumber.trim() || !transactionId.trim())}
                  onClick={choice === 'ssl' ? payOnline : submitManual}
                  leftIcon={choice === 'ssl' ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {choice === 'ssl' ? `Pay ${taka(amount)} securely` : 'Submit payment for approval'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
