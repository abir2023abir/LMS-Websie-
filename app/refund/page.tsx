import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

const sections = [
  {
    heading: '1. 7-Day Money-Back Window',
    body: 'If you are not satisfied with a paid English Capsule, you may request a full refund within 7 days of purchase, provided you have completed less than 20% of the course lessons (as tracked automatically by your student dashboard progress).',
  },
  {
    heading: '2. How to Request a Refund',
    body: 'Contact our support team through the enquiry form on the homepage or your dashboard, and include your registered email address and the course name. Refund requests are reviewed within 2 business days.',
  },
  {
    heading: '3. Processing Time',
    body: 'Approved refunds are returned to the original payment method (card, bKash, or Nagad via SSLCommerz). Depending on your bank or wallet provider, it can take 7–15 business days for the amount to appear in your account.',
  },
  {
    heading: '4. When Refunds Are Not Applicable',
    body: 'Refunds cannot be issued after the 7-day window, after more than 20% of lessons have been completed, for free capsules, or in cases where course access was shared, recorded, or redistributed in violation of our Terms of Service.',
  },
  {
    heading: '5. Course Cancellations & Changes',
    body: 'If English Capsules permanently discontinues a course you purchased, you may choose an equivalent replacement capsule or a full prorated refund, at your discretion.',
  },
  {
    heading: '6. Certificate & Progress Impact',
    body: 'Once a refund is processed, access to the course content, progress records, and any certificate issued for that course will be revoked.',
  },
];

export const metadata = {
  title: 'Refund Policy | English Capsules',
  description: 'English Capsules refund terms for paid course capsules.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-20 w-full">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Legal</p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mb-3">Refund Policy</h1>
        <p className="text-slate-500 text-sm mb-10">
          Last updated: October 2026. Ready to request a refund?{' '}
          <Link href="/#contact" className="text-amber-600 font-semibold hover:underline">Contact support</Link>.
        </p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display font-bold text-lg text-[#111827] mb-2">{s.heading}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <EnglishFooter />
    </div>
  );
}
