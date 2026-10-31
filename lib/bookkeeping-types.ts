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
    { id: 'bookkeeping-light', name: 'Bookkeeping Light', description: 'Essential monthly bookkeeping for small and new businesses.', price: 0, note: '', features: ['Monthly recording of sales, purchases, and expenses', 'Bank and mobile banking (bKash, Nagad) reconciliation', 'Simple monthly profit & loss summary', 'Support by phone, WhatsApp, and email'], categories: ['Bookkeeping + Software', 'Just Bookkeeping'], popular: false },
    { id: 'bookkeeping', name: 'Bookkeeping', description: 'Complete bookkeeping for growing businesses.', price: 0, note: '', features: ['Everything in Bookkeeping Light', 'Accounts receivable and payable tracking', 'Monthly profit & loss, balance sheet, and cash flow reports', 'Year-end financial statements ready for your accountant', 'A dedicated bookkeeper for your business'], categories: ['Bookkeeping + Software', 'Just Bookkeeping'], popular: true },
    { id: 'bookkeeping-tax', name: 'Bookkeeping + Tax', description: 'Bookkeeping plus VAT and income tax support.', price: 0, note: '', features: ['Everything in Bookkeeping', 'Monthly VAT return preparation', 'Annual income tax return preparation', 'Tax planning check-ins during the year'], categories: ['Bookkeeping + Software', 'Taxes'], popular: false },
  ],
};
