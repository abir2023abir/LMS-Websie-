import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import DemoPreviewBar from '@/components/student/DemoPreviewBar';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { STALE_BUILD_RELOAD } from '@/lib/stale-build-reload';
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

const bangla = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-bn',
});

export const metadata: Metadata = {
  title: 'Career Bridge.Studio — Practical Learning for Your Next Step',
  description:
    'Build practical skills with structured courses, guided learning, and progress tracking from Career Bridge.Studio.',
  keywords: [
    'Career Bridge Studio',
    'online learning',
    'practical skills',
    'structured courses',
    'career development',
  ],
  openGraph: {
    title: 'Career Bridge.Studio — Practical Learning for Your Next Step',
    description: 'Build practical skills with structured courses, guided learning, and progress tracking.',
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${bangla.variable}`}>
      <head>
        {/* Reloads a tab left open across a deployment instead of showing "Application error". */}
        <script dangerouslySetInnerHTML={{ __html: STALE_BUILD_RELOAD }} />
      </head>
      <body className="min-h-screen bg-white text-[#111827] antialiased">
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
          <DemoPreviewBar />
        </AuthProvider>
      </body>
    </html>
  );
}
