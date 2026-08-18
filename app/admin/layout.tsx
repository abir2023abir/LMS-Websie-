import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Panel — English Capsules',
  description: 'Restricted access: English Capsules LMS administrator dashboard.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Isolated layout: no global navbar, footer, or auth context
    <div className="min-h-screen">
      {children}
    </div>
  );
}
