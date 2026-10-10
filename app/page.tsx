import FloatingNavbar from '@/components/english/FloatingNavbar';
import HeroSection from '@/components/english/HeroSection';
import StatsSection from '@/components/english/StatsSection';
import CollageSection from '@/components/english/CollageSection';
import ProgramsSection from '@/components/english/ProgramsSection';
import KidsSection from '@/components/english/KidsSection';
import WhyUsSection from '@/components/english/WhyUsSection';
import ReviewsSection from '@/components/english/ReviewsSection';
import LearningMethodsSection from '@/components/english/LearningMethodsSection';
import ContactFormSection from '@/components/english/ContactFormSection';
import OffersBanner from '@/components/english/OffersBanner';
import EnglishFooter from '@/components/english/EnglishFooter';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased selection:bg-[#FACC15] selection:text-[#111827]">
      <FloatingNavbar />
      <HeroSection />
      <StatsSection />
      <CollageSection />
      <ProgramsSection />
      <KidsSection />
      <WhyUsSection />
      <ReviewsSection />
      <LearningMethodsSection />
      <ContactFormSection />
      <OffersBanner />
      <EnglishFooter />
    </main>
  );
}
