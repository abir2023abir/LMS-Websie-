import fs from 'fs';
import { randomUUID } from 'crypto';
import { dataPath } from '@/lib/data-dir';

export type OrientationProgramme = {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  event_time?: string | null;
  duration?: string | null;
  format?: string | null;
  status?: string | null;
  registration_url?: string | null;
  is_active: boolean;
  order_index: number;
};

const storePath = dataPath('orientation-programmes.json');

function read(): OrientationProgramme[] {
  try {
    const rows = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function write(rows: OrientationProgramme[]) {
  fs.mkdirSync(dataPath(), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(rows, null, 2), 'utf8');
}

export function localOrientationProgrammes() {
  return read().sort((a, b) => a.order_index - b.order_index);
}

export function saveLocalOrientationProgramme(input: Omit<OrientationProgramme, 'id' | 'order_index'> & { id?: string }) {
  const rows = read();
  const index = input.id ? rows.findIndex((row) => row.id === input.id) : -1;
  const next: OrientationProgramme = {
    ...input,
    id: index >= 0 ? rows[index].id : randomUUID(),
    order_index: index >= 0 ? rows[index].order_index : rows.length + 1,
  };
  if (index >= 0) rows[index] = next;
  else rows.push(next);
  write(rows);
  return next;
}

export function updateLocalOrientationProgramme(id: string, patch: Partial<OrientationProgramme>) {
  const rows = read();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error('Programme not found.');
  rows[index] = { ...rows[index], ...patch, id };
  write(rows);
  return rows[index];
}

export function deleteLocalOrientationProgramme(id: string) {
  write(read().filter((row) => row.id !== id));
}
