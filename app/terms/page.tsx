import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

const sections = [
  {
    heading: '1. Acceptance of Terms',
    body: 'By accessing English Capsules, registering an account, purchasing a course capsule, or using any of our learning materials, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the platform.',
  },
  {
    heading: '2. Accounts & Enrollment',
    body: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Course enrollment is confirmed only after successful payment (or confirmation of a free capsule) and is personal to the enrolled student. Sharing accounts, credentials, or purchased course access with third parties is prohibited.',
  },
  {
    heading: '3. Course Content & Intellectual Property',
    body: 'All video capsules, lessons, quizzes, worksheets, certificates, and materials provided through English Capsules are protected by copyright and remain the property of English Capsules and its instructors. You may use purchased content for personal learning only. Downloading, recording, reproducing, reselling, or redistributing any course material without written permission is not allowed.',
  },
  {
    heading: '4. Certificates',
    body: 'Completion certificates are issued to students who reach 100% module completion and pass the required assessments. Certificates can be verified publicly through our Verify Certificate page using the certificate ID. English Capsules may revoke a certificate in cases of academic dishonesty.',
  },
  {
    heading: '5. Payments',
    body: 'Payments are processed through our payment partners (including SSLCommerz, bKash, and Nagad). Prices are shown in Bangladeshi Taka. We reserve the right to correct pricing errors and to modify or discontinue courses.',
  },
  {
    heading: '6. Acceptable Use',
    body: 'You agree not to disrupt the platform, attempt to gain unauthorized access to any systems, upload malicious content, or misuse discussion features. Violations may result in suspension or termination of access without refund.',
  },
  {
    heading: '7. Limitation of Liability',
    body: 'English Capsules provides language training services and makes no guarantee of specific exam scores, employment outcomes, or immigration results. To the maximum extent permitted by law, our liability is limited to the amount paid by you for the relevant course.',
  },
  {
    heading: '8. Changes to These Terms',
    body: 'We may update these Terms of Service from time to time. Material changes will be reflected on this page. Continued use of the platform after changes constitutes acceptance of the updated terms.',
  },
];

export const metadata = {
  title: 'Terms of Service | English Capsules',
  description: 'The terms that govern the use of the English Capsules learning platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-20 w-full">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Legal</p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mb-3">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">
          Last updated: October 2026. Questions about these terms?{' '}
          <Link href="/#contact" className="text-amber-600 font-semibold hover:underline">Contact our team</Link>.
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
