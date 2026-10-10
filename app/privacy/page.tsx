import Link from 'next/link';
import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';

const sections = [
  {
    heading: '1. Information We Collect',
    body: 'We collect the information you provide when you register: your name, email address, phone number (optional), skill level, and course enrollment history. When you study, we store lesson progress, quiz results, and certificate records. Payments are processed by our payment partners; we do not store your full card, bKash, or Nagad credentials on our servers.',
  },
  {
    heading: '2. How We Use Your Information',
    body: 'Your data is used to deliver course access, track and display your learning progress, issue verifiable certificates, send enrollment and important service emails, and improve our English programs. We never sell your personal information to third parties.',
  },
  {
    heading: '3. Cookies & Local Storage',
    body: 'We use essential cookies for admin session security and browser local storage to keep your student progress available offline and synced to our database when a connection is restored. No advertising or cross-site tracking cookies are used.',
  },
  {
    heading: '4. Data Sharing',
    body: 'We share data only with the service providers that help us operate the platform: Firebase (hosting the database and authentication), SSLCommerz (payment processing), and our email delivery provider. Each processes data under their own security and privacy commitments.',
  },
  {
    heading: '5. Certificate Verification',
    body: 'Certificates are publicly verifiable by certificate ID on our Verify Certificate page. This lookup exposes only the student name, course title, and completion date — never contact details.',
  },
  {
    heading: '6. Data Retention & Security',
    body: 'We retain account and progress data for as long as your account is active. Data is protected with transport-layer encryption (HTTPS), HTTP-only security cookies, and access-controlled databases. You may request deletion of your account and associated personal data at any time.',
  },
  {
    heading: '7. Your Rights',
    body: 'You can access, correct, or request deletion of your personal data by contacting us. If you are under 13, a parent or guardian should enroll you in our Kids English program and manage account data on your behalf.',
  },
  {
    heading: '8. Policy Updates',
    body: 'If we make material changes to this policy, we will update the date at the top of this page and notify enrolled students by email where required by law.',
  },
];

export const metadata = {
  title: 'Privacy Policy | English Capsules',
  description: 'How English Capsules collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-20 w-full">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Legal</p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111827] mb-3">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">
          Last updated: October 2026. Privacy questions?{' '}
          <Link href="/#contact" className="text-amber-600 font-semibold hover:underline">Reach our advisors</Link>.
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
