import lazy from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import SuccessStories from '@/components/landing/SuccessStories';
import ServiceSection from '@/components/landing/ServiceSection';
import LatestFromLms from '@/components/landing/LatestFromLms';
import BlogAndContact from '@/components/landing/BlogAndContact';

const CoursesSection = lazy(() => import('@/components/landing/CoursesSection'));
const Testimonials = lazy(() => import('@/components/landing/Testimonials'));
const Footer = lazy(() => import('@/components/landing/Footer'));

// Read the saved content on every visit, so a part appears as soon as the admin adds data for it.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased selection:bg-[#FACC15] selection:text-[#111827]">
      <Navbar />
      <Hero />
      <About />
      <SuccessStories />
      <CoursesSection />
      <ServiceSection />
      <Testimonials />
      <LatestFromLms />
      <BlogAndContact />
      <Footer />
    </main>
  );
}
