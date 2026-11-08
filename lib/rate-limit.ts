import { clientIp } from '@/lib/login-limit';

// Simple per-address limit for public forms (contact, service requests, signup). Counts live in memory,
// so each server instance keeps its own; that is enough to stop a script from flooding the inbox.
const hits = new Map<string, number[]>();

/** Returns true when this address already used its allowance for `name` in the window. */
export function rateLimited(request: Request, name: string, max: number, windowMs: number): boolean {
  const key = `${name}:${clientIp(request)}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [stale, times] of hits) if (!times.some((time) => now - time < windowMs)) hits.delete(stale);
  return false;
}

export const TOO_MANY = { success: false, message: 'Too many requests. Please wait a few minutes and try again.' };
