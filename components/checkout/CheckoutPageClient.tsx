'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, ShieldCheck, Lock, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'bkash' | 'nagad'>('sslcommerz');
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
          price: course.price,
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
        router.push('/dashboard/student?enrolled=true');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Back Nav */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#FEF9C3] border border-[#FACC15]/40 text-[#111827] rounded-full px-3.5 py-1 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Secure Checkout</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
            Complete Your Enrollment
          </h1>
          <p className="text-slate-600 text-sm">
            Get instant lifetime access to course videos, resources, and certificate.
          </p>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Course Summary Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
              <span className="absolute top-3 left-3 bg-[#111827] text-[#FACC15] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                {course.category || 'English Capsule'}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-xl text-[#111827] leading-snug">
                {course.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {course.description}
              </p>
            </div>

            {/* Course Meta Info */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FACC15]" />
                <div>
                  <div className="font-bold text-slate-800">{course.duration || '20h+'}</div>
                  <div className="text-[10px] text-slate-500">Duration</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FACC15]" />
                <div>
                  <div className="font-bold text-slate-800">{course.lessonCount || 24} Lectures</div>
                  <div className="text-[10px] text-slate-500">Total Lessons</div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Course Regular Price</span>
                <span className="line-through">${course.originalPrice || course.price * 2}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Special Offer Discount</span>
                <span className="text-green-600 font-bold">-${(course.originalPrice || course.price * 2) - course.price}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 font-display">
                <span className="font-extrabold text-sm text-[#111827]">Total Amount</span>
                <span className="font-extrabold text-3xl text-[#111827]">${course.price}</span>
              </div>
            </div>

            <div className="bg-[#FEFCE8] border border-[#FEF9C3] p-3.5 rounded-2xl flex items-center gap-3 text-xs text-slate-700">
              <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span>30-Day Money Back Guarantee · Instant Access</span>
            </div>
          </div>

          {/* Right Column: User Details & Payment Method Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <h3 className="font-display font-extrabold text-lg text-[#111827] flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Your Details & Payment Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="checkout-full-name" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="checkout-full-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#FACC15] focus:bg-white transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="checkout-email-address" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="checkout-email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#FACC15] focus:bg-white transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label htmlFor="checkout-phone-number" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  id="checkout-phone-number"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#FACC15] focus:bg-white transition-all"
                />
              </div>

              {/* Payment Gateway Selector */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* SSLCommerz */}
                  <label
                    onClick={() => setPaymentMethod('sslcommerz')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-1 ${
                      paymentMethod === 'sslcommerz'
                        ? 'border-[#FACC15] bg-[#FEFCE8]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#111827]" />
                    <span className="font-extrabold text-xs text-[#111827]">SSLCommerz</span>
                    <span className="text-[10px] text-slate-500">Cards / Banking</span>
                  </label>

                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod('bkash')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-1 ${
                      paymentMethod === 'bkash'
                        ? 'border-[#FACC15] bg-[#FEFCE8]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-black text-xs text-pink-600">bKash</span>
                    <span className="font-extrabold text-xs text-[#111827]">bKash Direct</span>
                    <span className="text-[10px] text-slate-500">Mobile Wallet</span>
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod('nagad')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-1 ${
                      paymentMethod === 'nagad'
                        ? 'border-[#FACC15] bg-[#FEFCE8]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-black text-xs text-orange-600">Nagad</span>
                    <span className="font-extrabold text-xs text-[#111827]">Nagad Pay</span>
                    <span className="text-[10px] text-slate-500">Mobile Wallet</span>
                  </label>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-[#FACC15]/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#111827]/30 border-t-[#111827] rounded-full animate-spin" />
                    <span>Connecting to SSLCommerz Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Pay ${course.price} & Complete Enrollment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
