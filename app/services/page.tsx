import type { Metadata } from 'next';
import ServicesView from '@/components/english/ServicesView';

export const metadata: Metadata = {
  title: 'Live Coaching Plans — English Capsules',
  description:
    'Monthly speaking, fluency, and IELTS private plans, plus one-time mock tests, interview practice, and kids phonics.',
};

export default function ServicesPage() {
  return <ServicesView />;
}
