'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Check,
  Award,
} from 'lucide-react';
import { BkashMark, CardMark, NagadMark, SslMark } from '@/components/checkout/PayMarks';
import { takaFromUsd, usdToBdt } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { CourseSchema } from '@/types/course';

interface Props {
  course: CourseSchema;
}

export default function CheckoutPageClient({ course }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'bkash' | 'nagad' | 'card'>('bkash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          price: usdToBdt(course.price),
          name,
          email,
          phone,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment initialization failed');
      }

      // If SSLCommerz returned gateway URL, redirect to SSLCommerz payment portal
      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl;
      } else {
        // Fallback / mock payment success redirect to student dashboard
        router.push('/student?enrolled=true');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-white flex flex-col justify-between selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full flex-1 space-y-8">
        {/* Top Back Nav */}
        <div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#FACC15]" />
            <span>Back to All Capsules</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] rounded-full px-3.5 py-1 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 fill-[#FACC15]" />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Complete Your Capsule Enrollment
          </h1>
          <p className="text-slate-400 text-sm">
            Instant lifetime access to video lectures, practice exercises, and accredited diploma.
          </p>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Course Summary Card */}
          <div className="lg:col-span-5 bg-[#111827] rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-800 border border-white/10">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
              <span className="absolute top-3 left-3 bg-[#111827]/90 text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                {course.category || 'English Capsule'}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white leading-snug">
                {course.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Course Perks */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15] stroke-[3]" />
                <span>Full Lifetime Access (Self-Paced)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15] stroke-[3]" />
                <span>Downloadable Study Notes & Practice Audio</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FACC15] stroke-[3]" />
                <span>Official English Capsules Diploma</span>
              </div>
            </div>

            {/* Price Summary */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Original Price</span>
                <span className="line-through">{takaFromUsd(course.originalPrice || (course.price * 2))}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Scholarship Discount</span>
                <span>-{takaFromUsd((course.originalPrice || course.price * 2) - course.price)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="font-display font-bold text-base text-white">Total Amount Due</span>
                <span className="font-display font-extrabold text-2xl text-[#FACC15]">
                  {takaFromUsd(course.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Payment Form */}
          <div className="lg:col-span-7 bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
            <h2 className="font-display font-bold text-xl text-white">
              Student & Billing Information
            </h2>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name (As printed on certificate)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Saiful Islam"
                  className="w-full bg-[#1a2234] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address (For course access)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full bg-[#1a2234] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-[#1a2234] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FACC15] transition-colors"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Payment Gateway
                </label>

                <div className="grid grid-cols-2 gap-3">
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
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === id
                          ? 'bg-[#FACC15] text-[#111827] border-[#FACC15] shadow-lg shadow-[#FACC15]/20 font-bold'
                          : 'bg-[#1a2234] border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {mark}
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-xs sm:text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#FACC15]/25 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {takaFromUsd(course.price)} & Unlock Capsule</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-[#FACC15]" />
                <span>256-Bit SSL Encrypted • 30-Day Money-Back Guarantee</span>
              </div>
            </form>
          </div>
        </div>
      </main>

      <EnglishFooter />
    </div>
  );
}
