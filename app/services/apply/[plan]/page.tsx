import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceApplyView from '@/components/english/ServiceApplyView';
import { getOffer, priceLabel } from '@/lib/service-catalog';

type Props = { params: { plan: string } };

export function generateMetadata({ params }: Props): Metadata {
  const offer = getOffer(params.plan);
  if (!offer) return { title: 'Service — English Capsules' };
  return {
    title: `${offer.name} — ${priceLabel(offer)} — English Capsules`,
    description: offer.tagline,
  };
}

export default function ApplyServicePage({ params }: Props) {
  const offer = getOffer(params.plan);
  if (!offer) notFound();
  return <ServiceApplyView offer={offer} />;
}
