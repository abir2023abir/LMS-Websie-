'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import { useAuth } from '@/context/AuthContext';
import { takaFromUsd } from '@/lib/utils';
import type { CourseSchema } from '@/types/course';

export default function CheckoutPageClient({ course, paymentStatus }: { course: CourseSchema; paymentStatus?: string }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const next = `/checkout/${encodeURIComponent(course.id || '')}`;
  const accountRequired = !user || role !== 'Student';

  return (
    <div className="min-h-screen bg-slate-50 text-[#111827]">
      <FloatingNavbar />
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <Link href="/courses" className="text-sm font-semibold text-slate-600 underline underline-offset-4">Back to all courses</Link>
        {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {paymentStatus === 'cancelled' ? 'The payment was cancelled.' : 'The payment could not be completed.'} You can try again below. If money was deducted, contact us with your transaction details.
          </div>
        )}
        <div className="mt-3 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:grid-cols-[240px_1fr] sm:gap-6 sm:p-7">
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-square">
            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Course enrollment</p>
            <h1 className="mt-1 font-display text-lg font-extrabold leading-snug sm:mt-2 sm:text-3xl">{course.title}</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 sm:mt-3 sm:text-sm">{course.description}</p>
            <p className="mt-2 text-xl font-extrabold sm:mt-5 sm:text-2xl">{takaFromUsd(course.price)}</p>
            {accountRequired && <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:mt-6 sm:p-4">
              <p className="text-sm font-bold sm:text-base">A student account is required before enrollment.</p>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">Student registration requires your full name, email address, and phone number.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-3">
                <Link href={`/signup?next=${encodeURIComponent(next)}`} className="flex items-center justify-center rounded-xl bg-[#FACC15] px-2 py-3 text-center text-xs font-extrabold text-[#111827] sm:px-5 sm:text-sm">Create student account</Link>
                <Link href={`/login?next=${encodeURIComponent(next)}`} className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-2 py-3 text-center text-xs font-bold sm:bg-transparent sm:px-5 sm:text-sm">Sign in</Link>
              </div>
            </div>}
          </div>
        </div>
      </main>
      <EnglishFooter />
      {!accountRequired && <CheckoutModal course={course} isOpen onClose={() => router.push('/courses')} />}
    </div>
  );
}
