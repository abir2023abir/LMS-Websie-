import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'English Capsules — The Largest Community For Learning English',
  description:
    'Learn English in a practical and easy way with English Capsules. Short, effective sessions designed to fit your time and goals.',
  keywords: [
    'English Capsules',
    'Learn English',
    'Spoken English',
    'IELTS Prep',
    'Business English',
  ],
  openGraph: {
    title: 'English Capsules — The Largest Community For Learning English',
    description:
      'Practical & easy English learning sessions. Join 40,000+ successful students.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-white text-[#111827] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
