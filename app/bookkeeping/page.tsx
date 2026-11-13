import type { Metadata } from 'next';
import { getBookkeepingPageContent } from '@/lib/bookkeeping-content';
import { getContactBookingContent } from '@/lib/contact-booking-content';
import BookkeepingPageClient from '@/components/landing/BookkeepingPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bookkeeping Services — Career Bridge.Studio',
  description: 'Reliable bookkeeping and clear financial reports to help you understand your business finances.',
};

export default function BookkeepingPage() {
  return <BookkeepingPageClient content={getBookkeepingPageContent()} booking={getContactBookingContent()} />;
}
