'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import type { CourseSchema } from '@/types/course';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react';

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
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'aamarpay' | 'bkash' | 'nagad' | 'card'>('sslcommerz');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalPrice = course.price ?? 49;
  const originalPrice = course.originalPrice ?? finalPrice * 2;
  const discountAmount = originalPrice - finalPrice;

  const handleProcessPayment = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        userId: user?.uid || 'anonymous',
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

      setSuccessTxn(data.transactionId);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        router.push('/student');
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Checkout Error:', err);
      setError(err.message || 'Failed to complete payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass rounded-3xl border border-white/10 w-full max-w-xl my-8 p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
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
            <p className="text-xs text-slate-400">Secure 256-bit Encrypted Checkout</p>
          </div>
        </div>

        {/* Success Banner */}
        {successTxn ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">Enrollment Successful!</h3>
            <p className="text-sm text-slate-300">
              Transaction ID: <span className="font-mono text-primary-300">{successTxn}</span>
            </p>
            <p className="text-xs text-slate-400">Redirecting to your Student Dashboard...</p>
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
                  <span className="font-bold text-white text-sm">${finalPrice}</span>
                  {discountAmount > 0 && (
                    <span className="text-xs text-slate-500 line-through">${originalPrice}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Gateway Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                    paymentMethod === 'sslcommerz'
                      ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg shadow-primary-600/20'
                      : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-primary-400" />
                  <span>SSLCommerz</span>
                  <span className="text-[9px] text-slate-500">Cards & Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('aamarpay')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                    paymentMethod === 'aamarpay'
                      ? 'bg-accent-500/20 border-accent-500 text-white shadow-lg shadow-accent-500/20'
                      : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-5 h-5 text-accent-400" />
                  <span>aamarPay</span>
                  <span className="text-[9px] text-slate-500">Local Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                    paymentMethod === 'bkash'
                      ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-pink-400" />
                  <span>bKash</span>
                  <span className="text-[9px] text-slate-500">Mobile Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                    paymentMethod === 'nagad'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span>Nagad</span>
                  <span className="text-[9px] text-slate-500">Mobile Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Debit/Credit Card</span>
                  <span className="text-[9px] text-slate-500">Visa / Mastercard</span>
                </button>
              </div>
            </div>

            {/* Price Calculation Summary */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span>${originalPrice}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Special Discount</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-display font-bold text-base text-white pt-2 border-t border-white/8">
                <span>Total Amount</span>
                <span className="text-primary-300">${finalPrice}</span>
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
                Complete Enrollment (${finalPrice})
              </Button>
              <p className="text-[11px] text-slate-500 text-center mt-3">
                Includes 30-day full refund guarantee. By clicking Complete Enrollment you agree to LearnVerse Terms of Service.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
