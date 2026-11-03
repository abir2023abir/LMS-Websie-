/** Tabs shared by the admin panel and the instructor panel. */
export const PANEL_TABS = [
  'Overview',
  'Courses',
  'Certificate',
  'Quizzes',
  'Exams',
  'Live Classes',
  'Progress',
  'Earnings',
  'Students',
  'Accounts',
  'Requests',
  'Messages',
  'Assignments',
  'Payments',
  'Landing Page CMS',
] as const;

export type PanelTab = (typeof PANEL_TABS)[number];

export function cleanTabs(input: unknown): PanelTab[] {
  const wanted = new Set(Array.isArray(input) ? input.map(String) : []);
  return PANEL_TABS.filter((tab) => wanted.has(tab));
}
