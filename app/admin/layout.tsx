import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ToastProvider from '@/components/admin/ToastProvider';

export const metadata: Metadata = {
  title: 'Admin Panel — Career Bridge.Studio',
  description: 'Restricted access: Career Bridge.Studio administrator dashboard.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Isolated layout: no global navbar, footer, or auth context
    <div className="min-h-screen">
      {children}
      <ToastProvider />
    </div>
  );
}
