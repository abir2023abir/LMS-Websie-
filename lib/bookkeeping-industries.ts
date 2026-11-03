export type IndustryFocus = { title: string; points: string[] };
export type IndustryValue = { title: string; detail: string };

export type BookkeepingIndustry = {
  slug: string;
  name: string;
  blurb: string;
  eyebrow: string;
  headline: string;
  description: string;
  focuses: IndustryFocus[];
  values: IndustryValue[];
};

const sharedValues = (aware: string): IndustryValue[] => [
  { title: 'Dedicated support', detail: 'One bookkeeper stays with your business and learns how you earn and spend.' },
  { title: aware, detail: 'Records follow the way your work actually happens, not a generic template.' },
  { title: 'Monthly bookkeeping', detail: 'Income, expenses, and reconciliations closed on a regular monthly cycle.' },
  { title: 'Year-end readiness', detail: 'Clean statements your accountant can use when the year closes.' },
  { title: 'Ongoing support', detail: 'Questions answered by phone, WhatsApp, or email between report dates.' },
];

export const bookkeepingIndustries: BookkeepingIndustry[] = [
  {
    slug: 'creative-agencies',
    name: 'Agencies & Creative',
    blurb: 'Project income, contractor costs, and client work kept in order.',
    eyebrow: 'BOOKKEEPING FOR CREATIVE AGENCIES',
    headline: 'Always Know Where Your Agency Stands Financially.',
    description: 'Understand your agency’s revenue, project costs, and profit with organized bookkeeping.',
    focuses: [
      { title: 'Creative & Branding', points: ['Project income and expense tracking', 'Contractor and production cost records'] },
      { title: 'Digital Marketing & PR', points: ['Client ad spend kept separate from agency revenue'] },
      { title: 'Dev & Product Studios', points: ['Contractor and software cost tracking', 'Retainer records'] },
    ],
    values: [
      { title: 'Dedicated support', detail: 'A bookkeeper who stays with the agency and knows your clients and projects.' },
      { title: 'Agency-aware records', detail: 'Project income, production costs, and retainers recorded the way an agency bills.' },
      { title: 'Monthly bookkeeping', detail: 'A monthly close so you can see revenue, project cost, and profit.' },
      { title: 'Year-end readiness', detail: 'Statements ready for your accountant when the year ends.' },
      { title: 'Ongoing support', detail: 'A direct line for questions between monthly reports.' },
    ],
  },
  {
    slug: 'consultants-freelancers',
    name: 'Consultants & Freelancers',
    blurb: 'Invoices, retainers, and business expenses in one clear set of books.',
    eyebrow: 'BOOKKEEPING FOR CONSULTANTS AND FREELANCERS',
    headline: 'See What You Earned, and What You Kept.',
    description: 'Keep client invoices, retainers, and business expenses organized so your profit is easy to read.',
    focuses: [
      { title: 'Client work', points: ['Invoice and retainer tracking', 'Unpaid invoices visible each month'] },
      { title: 'Business costs', points: ['Software, travel, and subcontractor expenses recorded separately'] },
      { title: 'Personal vs business', points: ['Business spending kept apart from personal transfers'] },
    ],
    values: sharedValues('Practice-aware records'),
  },
  {
    slug: 'real-estate',
    name: 'Real Estate Services',
    blurb: 'Commissions, deposits, and operating costs tracked by deal.',
    eyebrow: 'BOOKKEEPING FOR REAL ESTATE SERVICES',
    headline: 'Clear Numbers Behind Every Deal.',
    description: 'Track commissions, deposits, and office costs so you can see what each period actually earned.',
    focuses: [
      { title: 'Commissions', points: ['Commission income recorded as it is received', 'Referral fees kept visible'] },
      { title: 'Client funds', points: ['Deposits recorded separately from operating money'] },
      { title: 'Office costs', points: ['Rent, marketing, and staff costs tracked monthly'] },
    ],
    values: sharedValues('Deal-aware records'),
  },
  {
    slug: 'ecommerce',
    name: 'E-Commerce Online',
    blurb: 'Sales, fees, refunds, and inventory costs reconciled each month.',
    eyebrow: 'BOOKKEEPING FOR ONLINE STORES',
    headline: 'Know Your Store’s Real Profit.',
    description: 'Separate sales, platform fees, refunds, and product costs so the number you see is the profit you kept.',
    focuses: [
      { title: 'Sales channels', points: ['Marketplace and website sales recorded by channel'] },
      { title: 'Fees and refunds', points: ['Platform fees, payment fees, and refunds tracked apart from sales'] },
      { title: 'Product costs', points: ['Inventory purchases and shipping recorded against the period'] },
    ],
    values: sharedValues('Store-aware records'),
  },
  {
    slug: 'restaurants',
    name: 'Restaurants & Cafés',
    blurb: 'Daily sales, suppliers, and staff costs summarized every month.',
    eyebrow: 'BOOKKEEPING FOR RESTAURANTS AND CAFÉS',
    headline: 'A Clear Picture of the Month’s Trade.',
    description: 'Bring daily sales, supplier bills, and staff costs into monthly reports you can actually use.',
    focuses: [
      { title: 'Daily sales', points: ['Card, cash, and delivery sales recorded together'] },
      { title: 'Suppliers', points: ['Food, beverage, and packaging bills tracked'] },
      { title: 'Staff and rent', points: ['Wages, rent, and utilities kept in the monthly close'] },
    ],
    values: sharedValues('Service-aware records'),
  },
  {
    slug: 'plumbers',
    name: 'Plumber',
    blurb: 'Job income, materials, and van costs recorded job by job.',
    eyebrow: 'BOOKKEEPING FOR PLUMBING BUSINESSES',
    headline: 'Know Which Jobs Paid, and Which Only Looked Busy.',
    description: 'Track call-out income, materials, and running costs so the books match the work on the road.',
    focuses: [
      { title: 'Jobs', points: ['Call-out and project income recorded as paid'] },
      { title: 'Materials', points: ['Parts and supplier bills kept against the period'] },
      { title: 'Running costs', points: ['Fuel, tools, and vehicle costs tracked monthly'] },
    ],
    values: sharedValues('Trade-aware records'),
  },
  {
    slug: 'spas',
    name: 'Spa',
    blurb: 'Treatment income, product sales, and therapist costs in one report.',
    eyebrow: 'BOOKKEEPING FOR SPAS',
    headline: 'See the Month Behind the Appointment Book.',
    description: 'Organize treatment income, retail sales, and staff costs into reports you can review each month.',
    focuses: [
      { title: 'Treatments', points: ['Service income recorded by the month'] },
      { title: 'Retail', points: ['Product sales kept separate from treatment income'] },
      { title: 'Team costs', points: ['Therapist pay and room costs tracked'] },
    ],
    values: sharedValues('Spa-aware records'),
  },
  {
    slug: 'dry-cleaners',
    name: 'Dry Cleaners',
    blurb: 'Counter sales, supplier chemicals, and shop costs closed monthly.',
    eyebrow: 'BOOKKEEPING FOR DRY CLEANERS',
    headline: 'Shop Sales and Costs, Closed Every Month.',
    description: 'Keep counter takings, supplier bills, and shop expenses organized so the month is easy to review.',
    focuses: [
      { title: 'Counter sales', points: ['Daily takings summarized for the month'] },
      { title: 'Supplies', points: ['Chemicals, packaging, and hanger costs recorded'] },
      { title: 'Shop costs', points: ['Rent, utilities, and wages included in the close'] },
    ],
    values: sharedValues('Shop-aware records'),
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    blurb: 'Practice income, clinic costs, and supplier bills kept confidential and current.',
    eyebrow: 'BOOKKEEPING FOR HEALTHCARE PRACTICES',
    headline: 'Practice Finances, Organized and Private.',
    description: 'Track practice income and clinic costs with records handled carefully and reported every month.',
    focuses: [
      { title: 'Practice income', points: ['Patient and insurance receipts recorded'] },
      { title: 'Clinic costs', points: ['Supplies, rent, and staff costs tracked'] },
      { title: 'Confidential handling', points: ['Financial files shared only with the people you approve'] },
    ],
    values: sharedValues('Practice-aware records'),
  },
  {
    slug: 'salons',
    name: 'Salons',
    blurb: 'Chair income, retail, and stylist costs summarized each month.',
    eyebrow: 'BOOKKEEPING FOR SALONS',
    headline: 'Know What the Salon Earned This Month.',
    description: 'Separate service income, product sales, and stylist costs so the monthly result is clear.',
    focuses: [
      { title: 'Services', points: ['Chair and treatment income recorded'] },
      { title: 'Retail', points: ['Product sales kept apart from service income'] },
      { title: 'Team', points: ['Stylist pay and booth costs tracked monthly'] },
    ],
    values: sharedValues('Salon-aware records'),
  },
];

export function getBookkeepingIndustry(slug: string) {
  return bookkeepingIndustries.find((item) => item.slug === slug);
}
