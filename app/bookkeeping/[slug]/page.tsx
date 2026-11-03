import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IndustryPage from '@/components/bookkeeping/IndustryPage';
import { bookkeepingIndustries, getBookkeepingIndustry } from '@/lib/bookkeeping-industries';

export function generateStaticParams() {
  return bookkeepingIndustries.map((industry) => ({ slug: industry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const industry = getBookkeepingIndustry(params.slug);
  if (!industry) return { title: 'Bookkeeping — Career Bridge.Studio' };
  return {
    title: `${industry.name} Bookkeeping — Career Bridge.Studio`,
    description: industry.description,
  };
}

export default function BookkeepingIndustryPage({ params }: { params: { slug: string } }) {
  const industry = getBookkeepingIndustry(params.slug);
  if (!industry) notFound();
  return <IndustryPage industry={industry} />;
}
