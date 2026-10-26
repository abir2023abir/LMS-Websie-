import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';
import { defaultBookkeepingContent, type BookkeepingPageContent, type BookkeepingPlan } from '@/lib/bookkeeping-types';

export { defaultBookkeepingContent } from '@/lib/bookkeeping-types';
export type { BookkeepingPageContent, BookkeepingPlan } from '@/lib/bookkeeping-types';

const contentFile = dataPath('bookkeeping-page.json');

function normalizeContent(value: unknown): BookkeepingPageContent {
  if (!value || typeof value !== 'object') return defaultBookkeepingContent;
  const saved = value as Partial<BookkeepingPageContent>;
  const planDefaults = new Map(defaultBookkeepingContent.plans.map((plan) => [plan.id, plan]));
  const plans = Array.isArray(saved.plans) ? saved.plans.map((item) => {
    const plan = item as Partial<BookkeepingPlan>;
    const fallback = planDefaults.get(String(plan.id)) || defaultBookkeepingContent.plans[0];
    return {
      ...fallback,
      ...plan,
      id: String(plan.id || fallback.id),
      name: String(plan.name ?? fallback.name),
      description: String(plan.description ?? fallback.description),
      price: Number.isFinite(Number(plan.price)) ? Number(plan.price) : fallback.price,
      note: String(plan.note ?? fallback.note),
      features: Array.isArray(plan.features) ? plan.features.map(String) : fallback.features,
      categories: Array.isArray(plan.categories) ? plan.categories.map(String) : fallback.categories,
      popular: Boolean(plan.popular),
    };
  }) : defaultBookkeepingContent.plans;

  return {
    ...defaultBookkeepingContent,
    ...saved,
    eyebrow: String(saved.eyebrow ?? defaultBookkeepingContent.eyebrow),
    headline: String(saved.headline ?? defaultBookkeepingContent.headline),
    description: String(saved.description ?? defaultBookkeepingContent.description),
    selectorHint: String(saved.selectorHint ?? defaultBookkeepingContent.selectorHint),
    tabs: Array.isArray(saved.tabs) ? saved.tabs.map(String) : defaultBookkeepingContent.tabs,
    monthlyCta: String(saved.monthlyCta ?? defaultBookkeepingContent.monthlyCta),
    includedHeading: String(saved.includedHeading ?? defaultBookkeepingContent.includedHeading),
    popularBadge: String(saved.popularBadge ?? defaultBookkeepingContent.popularBadge),
    monthlySuffix: String(saved.monthlySuffix ?? defaultBookkeepingContent.monthlySuffix),
    annualSuffix: String(saved.annualSuffix ?? defaultBookkeepingContent.annualSuffix),
    annualDiscountCaption: String(saved.annualDiscountCaption ?? defaultBookkeepingContent.annualDiscountCaption),
    quoteCta: String(saved.quoteCta ?? defaultBookkeepingContent.quoteCta),
    annualHeading: String(saved.annualHeading ?? defaultBookkeepingContent.annualHeading),
    annualDiscount: Number.isFinite(Number(saved.annualDiscount)) ? Math.max(0, Math.min(100, Number(saved.annualDiscount))) : defaultBookkeepingContent.annualDiscount,
    annualCta: String(saved.annualCta ?? defaultBookkeepingContent.annualCta),
    plans,
  };
}

export function getBookkeepingPageContent(): BookkeepingPageContent {
  try {
    const raw = fs.readFileSync(contentFile, 'utf8');
    return normalizeContent(JSON.parse(raw));
  } catch {
    return defaultBookkeepingContent;
  }
}

export function saveBookkeepingPageContent(value: unknown): BookkeepingPageContent {
  const content = normalizeContent(value);
  fs.mkdirSync(path.dirname(contentFile), { recursive: true });
  fs.writeFileSync(contentFile, JSON.stringify(content, null, 2), 'utf8');
  return content;
}
