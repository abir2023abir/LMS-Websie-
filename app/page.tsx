import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import SuccessStories from '@/components/landing/SuccessStories';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import BlogAndContact from '@/components/landing/BlogAndContact';

const CoursesSection = dynamic(() => import('@/components/landing/CoursesSection'));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'));
const Footer = dynamic(() => import('@/components/landing/Footer'));

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased selection:bg-[#FACC15] selection:text-[#111827]">
      <Navbar />
      <Hero />
      <About />
      <SuccessStories />
      <CoursesSection />
      <WhyChooseUs />
      <Testimonials />
      <BlogAndContact />
      <Footer />
    </main>
  );
}
