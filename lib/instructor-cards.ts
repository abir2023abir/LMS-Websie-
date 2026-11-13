import { kvGet, kvSet } from '@/lib/kv-store';

/** Extra instructor details. Kept beside the account so the profile table does not need new columns. */
const KEY = 'instructor-cards';

export type InstructorCard = {
  phone: string;
  bio: string;
  university: string;
  degree: string;
};

const empty = (): InstructorCard => ({ phone: '', bio: '', university: '', degree: '' });

function clip(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max);
}

export function cleanCard(input: Partial<InstructorCard> | null | undefined): InstructorCard {
  return {
    phone: clip(input?.phone, 30),
    bio: clip(input?.bio, 600),
    university: clip(input?.university, 160),
    degree: clip(input?.degree, 160),
  };
}

export function hasEducation(card: InstructorCard) {
  return Boolean(card.university || card.degree);
}

export async function listCards(): Promise<Record<string, InstructorCard>> {
  return kvGet<Record<string, InstructorCard>>(KEY, {});
}

export async function getCard(profileId: string): Promise<InstructorCard> {
  const all = await listCards();
  return cleanCard(all[profileId]);
}

export async function saveCard(profileId: string, input: Partial<InstructorCard>) {
  const all = await listCards();
  all[profileId] = cleanCard(input);
  await kvSet(KEY, all);
  return all[profileId];
}

export { empty as emptyCard };
