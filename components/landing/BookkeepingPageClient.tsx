import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import BookkeepingHero from '@/components/bookkeeping/BookkeepingHero';
import AccountingStandards from '@/components/bookkeeping/AccountingStandards';
import GettingStarted from '@/components/bookkeeping/GettingStarted';
import WhoWeHelp from '@/components/bookkeeping/WhoWeHelp';
import PricingSelector from '@/components/bookkeeping/PricingSelector';
import ClientExperiences from '@/components/bookkeeping/ClientExperiences';
import BusinessInsights from '@/components/bookkeeping/BusinessInsights';
import ConsultationBookingForm from '@/components/messages/ConsultationBookingForm';
import type { ContactBookingContent } from '@/lib/contact-booking-types';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';

// The bookkeeping page's own menu (client layout): Industries instead of All Courses.
const NAV = [
  { name: 'Home', href: '/' },
  { name: 'Industries', href: '/bookkeeping#industries' },
  { name: 'Bookkeeping', href: '/bookkeeping' },
  { name: 'Contact', href: '/contact' },
];

/** Bookkeeping page, in the order of the client's layout (sections 01–08). */
export default function BookkeepingPageClient({ content, booking }: { content: BookkeepingPageContent; booking: ContactBookingContent }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#111827]">
      <FloatingNavbar items={NAV} />
      <BookkeepingHero />
      <main>
        <AccountingStandards />
        <GettingStarted />
        <WhoWeHelp />
        <PricingSelector content={content} />
        <ClientExperiences />
        <BusinessInsights />
      </main>
      <ConsultationBookingForm
        sectionId="consultation"
        initialService="Bookkeeping"
        content={{
          ...booking,
          description: 'Choose a time to discuss your bookkeeping service or business requirements. We’ll review your request and confirm it with you.',
          meetingTitle: 'Bookkeeping Consultation',
        }}
      />
      <EnglishFooter />
    </div>
  );
}
