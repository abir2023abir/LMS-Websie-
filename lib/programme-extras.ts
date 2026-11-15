import { kvGet, kvSet } from '@/lib/kv-store';

// Card picture and venue of a live programme. Kept beside the programme rows so the
// programme table itself does not need new columns.
export type ProgrammeExtras = { image_url?: string; venue?: string };

const KEY = 'cms-programme-extras';

export async function allProgrammeExtras(): Promise<Record<string, ProgrammeExtras>> {
  return kvGet<Record<string, ProgrammeExtras>>(KEY, {});
}

export async function saveProgrammeExtras(id: string, extras: ProgrammeExtras | null) {
  const all = await allProgrammeExtras();
  if (extras && (extras.image_url || extras.venue)) all[id] = extras;
  else delete all[id];
  await kvSet(KEY, all);
}

export async function withProgrammeExtras<T extends { id: string }>(rows: T[]): Promise<(T & ProgrammeExtras)[]> {
  const all = await allProgrammeExtras();
  return rows.map((row) => ({ ...row, image_url: all[row.id]?.image_url || '', venue: all[row.id]?.venue || '' }));
}
