import { kvGet, kvSet } from '@/lib/kv-store';

/**
 * Instructor profile photos. Each one is a small picture (resized in the browser) kept as a
 * data URL in the shared store, so it works on Vercel with no extra setup.
 */
const KEY = 'teacher-photos';
const MAX_LENGTH = 340000; // about 250 KB of picture

type Photos = Record<string, string>;

export function validPhoto(value: unknown): value is string {
  return typeof value === 'string' && value.length <= MAX_LENGTH && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}

export async function listPhotoOwners(): Promise<Set<string>> {
  return new Set(Object.keys(await kvGet<Photos>(KEY, {})));
}

export async function getPhoto(profileId: string): Promise<string | null> {
  const all = await kvGet<Photos>(KEY, {});
  return all[profileId] || null;
}

export async function setPhoto(profileId: string, photo: string | null) {
  const all = await kvGet<Photos>(KEY, {});
  const next = { ...all };
  if (photo) next[profileId] = photo;
  else delete next[profileId];
  await kvSet(KEY, next);
}
