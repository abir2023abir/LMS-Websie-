'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { recordLocalCourseEnrollment } from '@/lib/progress';
import Button from '@/components/ui/Button';
import type { CourseSchema } from '@/types/course';
import {
  X,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { BkashMark, CardMark, NagadMark, SslMark } from '@/components/checkout/PayMarks';
import { taka, usdToBdt } from '@/lib/utils';

interface CheckoutModalProps {
  course: CourseSchema;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const router = useRouter();
  const { user, role } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'bkash' | 'nagad' | 'card'>('bkash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  if (!isOpen) return null;

  const usdPrice = course.price ?? 49;
  const finalPrice = usdToBdt(usdPrice);
  const originalPrice = usdToBdt(course.originalPrice ?? usdPrice * 2);
  const discountAmount = originalPrice - finalPrice;

  const handleProcessPayment = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        userId: user?.uid,
        courseId: course.id || 'course-demo',
        courseTitle: course.title,
        amount: finalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment transaction failed.');
      }

      if (!user) throw new Error('Please sign in with a student account before enrolling.');
      recordLocalCourseEnrollment(user.uid, String(course.id || ''));
      setSuccessTxn(data.transactionId);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        router.push('/student');
      }, 1800);
    } catch (err: any) {
      console.error('Checkout Error:', err);
      setError(err.message || 'Failed to complete payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div className="glass rounded-2xl sm:rounded-3xl border border-white/10 w-full max-w-xl my-2 sm:my-8 p-4 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 min-h-11 min-w-11 flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Checkout & Enroll</h2>
            <p className="text-xs text-slate-400">Demo checkout · No live payment gateway</p>
          </div>
        </div>

        {/* Success Banner */}
        {successTxn ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">Demo enrollment complete</h3>
            <p className="text-sm text-slate-300">
              Test transaction: <span className="font-mono text-primary-300">{successTxn}</span>
            </p>
            <p className="text-xs text-slate-400">No payment was charged. Opening your Student Dashboard…</p>
          </div>
        ) : (
          !user || role !== 'Student' ? (
            <div className="space-y-4 rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/10 p-5 text-center">
              <p className="font-semibold text-white">Create or sign in to a student account before enrolling.</p>
              <p className="text-xs leading-relaxed text-slate-300">Your full name, email, and phone number are required for student registration.</p>
              <Link
                href={`/signup?next=${encodeURIComponent(`/courses?enroll=${course.id || ''}`)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-extrabold text-[#111827] hover:bg-[#eab308]"
              >
                Create student account
              </Link>
              <Link href={`/login?next=${encodeURIComponent(`/courses?enroll=${course.id || ''}`)}`} className="block text-xs font-semibold text-slate-200 underline underline-offset-4">
                Already registered? Sign in
              </Link>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Course Summary Item */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/8">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0 border border-white/10">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instructor: {course.instructorName || 'Lead Educator'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-white text-sm">{taka(finalPrice)}</span>
                  {discountAmount > 0 && (
                    <span className="text-xs text-slate-500 line-through">{taka(originalPrice)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Gateway Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  ['bkash', <BkashMark key="b" />, 'bKash'],
                  ['nagad', <NagadMark key="n" />, 'Nagad'],
                  ['card', <CardMark key="c" />, 'Debit / Credit card'],
                  ['sslcommerz', <SslMark key="s" />, 'SSLCommerz'],
                ] as const).map(([id, mark, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                      paymentMethod === id
                        ? 'bg-white/10 border-[#FACC15] text-white'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    {mark}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
              Test mode: payment choices are selectable, but no payment provider is connected and no real charge will be made.
            </p>

            {/* Price Calculation Summary */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span>{taka(originalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Special Discount</span>
                  <span>-{taka(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display font-bold text-base text-white pt-2 border-t border-white/8">
                <span>Total Amount</span>
                <span className="text-primary-300">{taka(finalPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="xl"
                fullWidth
                isLoading={loading}
                onClick={handleProcessPayment}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Run test enrollment ({taka(finalPrice)})
              </Button>
              <p className="text-[11px] text-slate-500 text-center mt-3">
                This demo records course access in this browser only. It does not process a real payment.
              </p>
            </div>
          </div>
          )
        )}
      </div>
    </div>
  );
}
