import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes intelligently.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** One US dollar shown as Bangladeshi taka. */
/** True when no real Firebase project is configured; Firestore calls would only hang. */
export function isFirebaseDemo(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !key || key.startsWith('AIzaSyDemo') || key === 'your-api-key' || key.includes('DemoKey');
}

export const USD_TO_BDT = 120;

export function usdToBdt(usd: number): number {
  return Math.round((usd || 0) * USD_TO_BDT);
}

/** Format an amount that is already in taka. */
export function taka(bdt: number): string {
  if (!bdt) return 'Free';
  return `৳${Math.round(bdt).toLocaleString('en-BD')}`;
}

/** Convert a dollar amount and format it as taka. */
export function takaFromUsd(usd: number): string {
  if (!usd) return 'Free';
  return taka(usdToBdt(usd));
}

/**
 * Format a stored dollar price as taka.
 */
export function formatPrice(price: number): string {
  return takaFromUsd(price);
}

/**
 * Format large numbers with K/M suffixes.
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

/**
 * Truncate a string to a max length.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}
