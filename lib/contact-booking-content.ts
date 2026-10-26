import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';
import { defaultContactBookingContent, type ContactBookingContent } from '@/lib/contact-booking-types';

const file = dataPath('contact-booking.json');
export { defaultContactBookingContent } from '@/lib/contact-booking-types';
export type { ContactBookingContent } from '@/lib/contact-booking-types';

export function normalizeContactBookingContent(value: unknown): ContactBookingContent {
  const saved = value && typeof value === 'object' ? value as Partial<ContactBookingContent> : {};
  const result = { ...defaultContactBookingContent, ...saved } as ContactBookingContent;
  for (const key of Object.keys(defaultContactBookingContent) as (keyof ContactBookingContent)[]) {
    const fallback = defaultContactBookingContent[key];
    const candidate = saved[key];
    if (Array.isArray(fallback)) {
      (result as any)[key] = Array.isArray(candidate) ? candidate.map(String).map((item) => item.trim()).filter(Boolean) : fallback;
    } else {
      (result as any)[key] = typeof candidate === 'string' ? candidate : fallback;
    }
  }
  if (!result.availableTimes.length) result.availableTimes = defaultContactBookingContent.availableTimes;
  if (result.weekdayLabels.length !== 7) result.weekdayLabels = defaultContactBookingContent.weekdayLabels;
  return result;
}

export function getContactBookingContent() {
  try { return normalizeContactBookingContent(JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch { return defaultContactBookingContent; }
}

export function saveContactBookingContent(value: unknown) {
  const content = normalizeContactBookingContent(value);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(content, null, 2), 'utf8');
  return content;
}
