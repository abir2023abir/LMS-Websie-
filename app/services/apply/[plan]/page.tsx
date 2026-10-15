import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceApplyView from '@/components/english/ServiceApplyView';
import { getOffer, priceLabel, type Billing } from '@/lib/service-catalog';

type Props = { params: { plan: string }; searchParams: { billing?: string } };

function billingOf(offerPeriod: string, raw?: string): Billing {
  if (offerPeriod === 'once') return 'once';
  return raw === 'year' ? 'year' : 'month';
}

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const offer = getOffer(params.plan);
  if (!offer) return { title: 'Service — English Capsules' };
  const billing = billingOf(offer.period, searchParams.billing);
  return {
    title: `${offer.name} — ${priceLabel(offer, billing)} — English Capsules`,
    description: offer.tagline,
  };
}

export default function ApplyServicePage({ params, searchParams }: Props) {
  const offer = getOffer(params.plan);
  if (!offer) notFound();
  return <ServiceApplyView offer={offer} billing={billingOf(offer.period, searchParams.billing)} />;
}
