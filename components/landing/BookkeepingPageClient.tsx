import FloatingNavbar from '@/components/english/FloatingNavbar';
import EnglishFooter from '@/components/english/EnglishFooter';
import BookkeepingHero from '@/components/bookkeeping/BookkeepingHero';
import GettingStarted from '@/components/bookkeeping/GettingStarted';
import WhoWeHelp from '@/components/bookkeeping/WhoWeHelp';
import PricingSelector from '@/components/bookkeeping/PricingSelector';
import BookkeepingFaq from '@/components/bookkeeping/BookkeepingFaq';
import ConsultationForm from '@/components/bookkeeping/ConsultationForm';
import type { BookkeepingPageContent } from '@/lib/bookkeeping-types';

export default function BookkeepingPageClient({ content }: { content: BookkeepingPageContent }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#111827]">
      <FloatingNavbar />
      <BookkeepingHero />
      <main>
        <GettingStarted />
        <WhoWeHelp />
        <PricingSelector content={content} />
        <BookkeepingFaq />
      </main>
      <ConsultationForm />
      <EnglishFooter />
    </div>
  );
}
