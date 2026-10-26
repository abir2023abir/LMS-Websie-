import { getBookkeepingPageContent } from '@/lib/bookkeeping-content';
import BookkeepingPageClient from '@/components/landing/BookkeepingPageClient';

export const dynamic = 'force-dynamic';

export default function BookkeepingPage() {
  return <BookkeepingPageClient content={getBookkeepingPageContent()} />;
}
