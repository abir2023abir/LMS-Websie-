import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import BookkeepingHero from '@/components/bookkeeping/BookkeepingHero';
import AccountingStandards from '@/components/bookkeeping/AccountingStandards';
import GettingStarted from '@/components/bookkeeping/GettingStarted';
import WhoWeHelp from '@/components/bookkeeping/WhoWeHelp';
import PricingSelector from '@/components/bookkeeping/PricingSelector';
import ClientExperiences from '@/components/bookkeeping/ClientExperiences';
import BusinessInsights from '@/components/bookkeeping/BusinessInsights';
import ContactCta from '@/components/landing/ContactCta';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';

// The bookkeeping page's own menu (client layout): Industries instead of All Courses.
const NAV = [
  { name: 'Home', href: '/' },
  { name: 'Industries', href: '/bookkeeping#industries' },
  { name: 'Bookkeeping', href: '/bookkeeping' },
  { name: 'Contact', href: '/contact' },
];

/** Bookkeeping page, in the order of the client's layout (sections 01–08). */
export default function BookkeepingPageClient({ content }: { content: BookkeepingPageContent }) {
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
      <ContactCta id="consultation" service="Bookkeeping" />
      <EnglishFooter />
    </div>
  );
}
