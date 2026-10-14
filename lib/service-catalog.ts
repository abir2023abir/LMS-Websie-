export type ServiceOffer = {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'once';
  tagline: string;
  features: string[];
  popular?: boolean;
  time?: string;
};

export const monthlyPlans: ServiceOffer[] = [
  {
    id: 'speaking',
    name: 'Speaking',
    price: 29,
    period: 'month',
    tagline: 'Group practice every week.',
    features: [
      '8 live group classes a month',
      'Real conversation, not worksheets',
      'Short questions on WhatsApp',
    ],
  },
  {
    id: 'fluency',
    name: 'Fluency',
    price: 59,
    period: 'month',
    tagline: 'The plan most learners stay on.',
    popular: true,
    features: [
      '12 live classes a month',
      '2 private sessions with a teacher',
      'Pronunciation and writing feedback',
      'Discount on any one course',
    ],
  },
  {
    id: 'ielts',
    name: 'IELTS Private',
    price: 99,
    period: 'month',
    tagline: 'For a test date that is already booked.',
    features: [
      '8 private classes a month',
      '1 full mock test',
      'Band score report',
      'Speaking and writing checked separately',
    ],
  },
];

export const singleSessions: ServiceOffer[] = [
  {
    id: 'mock',
    name: 'IELTS Mock Test',
    price: 25,
    period: 'once',
    time: 'One sitting',
    tagline: 'A full mock, then a band score report you can keep.',
    features: ['Full mock test', 'Band score report', 'Teacher notes on weak sections'],
  },
  {
    id: 'interview',
    name: 'Interview English',
    price: 35,
    period: 'once',
    time: '45 minutes',
    tagline: 'Job questions, your answers, and what to fix before the call.',
    features: ['45-minute live session', 'Your real interview questions', 'A short fix list after the call'],
  },
  {
    id: 'kids',
    name: 'Kids Phonics',
    price: 20,
    period: 'once',
    time: '40 minutes',
    tagline: 'One live session for ages 4–13. Sounds, not spelling lists.',
    features: ['40 minutes with a teacher', 'Ages 4–13', 'Sounds and pronunciation'],
  },
];

const allOffers = [...monthlyPlans, ...singleSessions];

export function getOffer(id: string): ServiceOffer | undefined {
  return allOffers.find((offer) => offer.id === id);
}

export function priceLabel(offer: ServiceOffer): string {
  return offer.period === 'month' ? `$${offer.price}/month` : `$${offer.price}`;
}
