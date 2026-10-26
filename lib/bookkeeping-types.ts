export type BookkeepingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  note: string;
  features: string[];
  categories: string[];
  popular: boolean;
};

export type BookkeepingPageContent = {
  eyebrow: string;
  headline: string;
  description: string;
  selectorHint: string;
  tabs: string[];
  monthlyCta: string;
  includedHeading: string;
  popularBadge: string;
  monthlySuffix: string;
  annualSuffix: string;
  annualDiscountCaption: string;
  quoteCta: string;
  annualHeading: string;
  annualDiscount: number;
  annualCta: string;
  plans: BookkeepingPlan[];
};

export const defaultBookkeepingContent: BookkeepingPageContent = {
  eyebrow: 'BOOKKEEPING SERVICES',
  headline: 'Bookkeeping that keeps your business on track',
  description: 'Choose the support that fits your business. Compare monthly plans and contact our team to confirm the right service and pricing for you.',
  selectorHint: 'Pick the service you need to see its pricing.',
  tabs: ['Bookkeeping + Software', 'Just Bookkeeping', 'Catch-up bookkeeping', 'Taxes'],
  monthlyCta: 'Get started',
  includedHeading: "What's included",
  popularBadge: 'Most popular',
  monthlySuffix: '/mo',
  annualSuffix: '/yr',
  annualDiscountCaption: '% off a 12-month plan',
  quoteCta: 'Request pricing',
  annualHeading: 'Prefer to pay for the year? Save 20%.',
  annualDiscount: 20,
  annualCta: 'Get started',
  plans: [
    { id: 'bookkeeping', name: 'Bookkeeping', description: 'Reliable bookkeeping for your growing business.', price: 399, note: '', features: ['Accurate books and year-end tax-ready financials', 'Unlimited access to your bookkeeper by phone, message, and video call'], categories: ['Bookkeeping + Software', 'Just Bookkeeping'], popular: false },
    { id: 'bookkeeping-tax', name: 'Bookkeeping + Tax', description: 'Full-service bookkeeping plus income tax filing and advisory.', price: 649, note: '', features: ['Everything in Bookkeeping', 'Licensed tax professionals', 'Up to four tax advisory calls annually', 'End-to-end business tax filing'], categories: ['Bookkeeping + Software', 'Taxes'], popular: true },
    { id: 'bookkeeping-light', name: 'Bookkeeping Light', description: 'Reliable bookkeeping for your micro business.*', price: 199, note: '*For businesses doing $250K a year or less in revenue.', features: ['Accurate books and year-end tax-ready financials', 'Unlimited access to your bookkeeper by phone, message, and video call'], categories: ['Bookkeeping + Software', 'Just Bookkeeping'], popular: false },
  ],
};
