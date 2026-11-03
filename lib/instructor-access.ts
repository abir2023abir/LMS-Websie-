import { kvGet, kvSet } from '@/lib/kv-store';
import { cleanTabs, PANEL_TABS, type PanelTab } from '@/lib/panel-tabs';

const KEY = 'instructor-access';

export async function listInstructorAccess(): Promise<Record<string, PanelTab[]>> {
  const saved = await kvGet<Record<string, string[]>>(KEY, {});
  const next: Record<string, PanelTab[]> = {};
  for (const [email, tabs] of Object.entries(saved || {})) {
    next[email.toLowerCase()] = cleanTabs(tabs);
  }
  return next;
}

export async function tabsForInstructor(email: string): Promise<PanelTab[]> {
  const all = await listInstructorAccess();
  return all[email.toLowerCase()] || [];
}

export async function saveInstructorTabs(email: string, tabs: unknown) {
  const all = await listInstructorAccess();
  all[email.toLowerCase()] = cleanTabs(tabs);
  await kvSet(KEY, all);
  return all[email.toLowerCase()];
}

export const everyPanelTab = () => [...PANEL_TABS];
