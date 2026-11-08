import { kvGet, kvSet } from '@/lib/kv-store';
import { listQuizzes, listAttempts } from '@/lib/quizzes';
import { attemptsFor, listExams } from '@/lib/exams';
import { listProfiles } from '@/lib/accounts';

/*
 * Quiz and exam retakes, repeated-failure Risk Alerts and the admin's interventions.
 * Alerts are worked out from the stored attempts, so every attempt stays in the history and an
 * alert resolves by itself when the student finally passes.
 */

export type AssessmentKind = 'quiz' | 'exam';
export type RiskActionKind = 'contact' | 'warning' | 'instructor-support' | 'study' | 'extra-attempts' | 'restrict-exams' | 'lift-restriction' | 'review';

export const RISK_ACTIONS: { key: RiskActionKind; label: string; hint: string }[] = [
  { key: 'contact', label: 'Contact student', hint: 'Sends the student a message' },
  { key: 'warning', label: 'Send warning', hint: 'Sends the student a warning' },
  { key: 'instructor-support', label: 'Assign instructor support', hint: 'Note who will support the student' },
  { key: 'study', label: 'Recommend additional study', hint: 'Sends study material or practice advice' },
  { key: 'extra-attempts', label: 'Allow additional attempts', hint: 'Adds attempts to this quiz or exam' },
  { key: 'restrict-exams', label: 'Temporary exam restriction', hint: 'Blocks exams in this course until lifted' },
  { key: 'lift-restriction', label: 'Lift exam restriction', hint: 'Lets the student take exams again' },
  { key: 'review', label: 'Admin review', hint: 'Record that progress and attempts were reviewed' },
];

export type RiskAction = { id: string; alertKey: string; action: RiskActionKind; note: string; extra: number; byId: string; byName: string; at: string };
export type RiskAttempt = { n: number; percent: number; passed: boolean; at: string };
export type RiskAlert = {
  key: string; kind: AssessmentKind; assessmentId: string; assessmentTitle: string;
  courseId: string; courseTitle: string; lessonTitle: string;
  studentId: string; studentName: string; studentEmail: string;
  failed: number; passMark: number; attempts: RiskAttempt[];
  status: 'open' | 'resolved'; resolvedAt: string;
  limit: number; extra: number; restricted: boolean; actions: RiskAction[];
};
export type StudentNotice = { id: string; kind: 'contact' | 'warning' | 'study'; text: string; by: string; courseId: string; at: string };

const SETTINGS_KEY = 'risk-settings';
const EXTRA_KEY = 'extra-attempts'; // studentId → "kind:id" → extra attempts
const RESTRICT_KEY = 'exam-restrictions'; // studentId → courseId → { by, at, note }
const ACTIONS_KEY = 'risk-actions';
const NOTICES_KEY = 'student-notices'; // studentId → notices
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ── settings ── */
export async function riskThreshold(): Promise<number> {
  const saved = await kvGet<{ threshold?: number }>(SETTINGS_KEY, {});
  const value = Math.round(Number(saved.threshold));
  return value >= 1 && value <= 20 ? value : 3;
}

export async function setRiskThreshold(value: number) {
  const threshold = Math.round(Number(value));
  if (!(threshold >= 1 && threshold <= 20)) throw new Error('The failed-attempt threshold must be between 1 and 20.');
  await kvSet(SETTINGS_KEY, { threshold });
  return threshold;
}

/* ── attempt limits ── */
export async function extraAttempts(studentId: string, kind: AssessmentKind, id: string): Promise<number> {
  const all = await kvGet<Record<string, Record<string, number>>>(EXTRA_KEY, {});
  return Math.max(0, Number(all[studentId]?.[`${kind}:${id}`]) || 0);
}

/** The attempts a student may use: the admin's limit plus any extra attempts granted. 0 = unlimited. */
export async function attemptLimit(studentId: string, kind: AssessmentKind, id: string, base: number): Promise<number> {
  if (!base) return 0;
  return base + (await extraAttempts(studentId, kind, id));
}

async function addExtraAttempts(studentId: string, kind: AssessmentKind, id: string, count: number) {
  const all = await kvGet<Record<string, Record<string, number>>>(EXTRA_KEY, {});
  const current = Number(all[studentId]?.[`${kind}:${id}`]) || 0;
  await kvSet(EXTRA_KEY, { ...all, [studentId]: { ...all[studentId], [`${kind}:${id}`]: current + count } });
}

/* ── exam restriction ── */
type Restriction = { by: string; at: string; note: string };
export async function examsRestricted(studentId: string, courseId: string): Promise<boolean> {
  const all = await kvGet<Record<string, Record<string, Restriction>>>(RESTRICT_KEY, {});
  return Boolean(all[studentId]?.[courseId]);
}

async function setRestriction(studentId: string, courseId: string, on: Restriction | null) {
  const all = await kvGet<Record<string, Record<string, Restriction>>>(RESTRICT_KEY, {});
  const mine = { ...(all[studentId] || {}) };
  if (on) mine[courseId] = on; else delete mine[courseId];
  await kvSet(RESTRICT_KEY, { ...all, [studentId]: mine });
}

/* ── notices shown to the student ── */
export async function noticesFor(studentId: string, courseId?: string): Promise<StudentNotice[]> {
  const all = await kvGet<Record<string, StudentNotice[]>>(NOTICES_KEY, {});
  return (all[studentId] || []).filter((item) => !courseId || item.courseId === courseId).slice(0, 5);
}

async function addNotice(studentId: string, notice: StudentNotice) {
  const all = await kvGet<Record<string, StudentNotice[]>>(NOTICES_KEY, {});
  await kvSet(NOTICES_KEY, { ...all, [studentId]: [notice, ...(all[studentId] || [])].slice(0, 20) });
}

/* ── alerts ── */
export async function listActions(): Promise<RiskAction[]> {
  const list = await kvGet<RiskAction[]>(ACTIONS_KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Every student who failed an assessment at least the threshold number of times. */
export async function riskAlerts(courseIds: Set<string> | null): Promise<RiskAlert[]> {
  const [threshold, quizzes, exams, quizAttempts, examAttempts, profiles, actions, extraAll, restrictAll] = await Promise.all([
    riskThreshold(), listQuizzes(), listExams(), listAttempts(), attemptsFor(), listProfiles(), listActions(),
    kvGet<Record<string, Record<string, number>>>(EXTRA_KEY, {}), kvGet<Record<string, Record<string, Restriction>>>(RESTRICT_KEY, {}),
  ]);
  const people = new Map(profiles.map((profile) => [profile.id, profile]));
  type Row = { at: string; percent: number; passed: boolean };
  const groups = new Map<string, { kind: AssessmentKind; assessmentId: string; studentId: string; rows: Row[] }>();
  const push = (kind: AssessmentKind, assessmentId: string, studentId: string, row: Row) => {
    const key = `${kind}:${assessmentId}:${studentId}`;
    const group = groups.get(key) || { kind, assessmentId, studentId, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  };
  quizAttempts.forEach((a) => push('quiz', a.quizId, a.studentId, { at: a.at, percent: a.percent, passed: a.passed }));
  examAttempts.filter((a) => a.status === 'submitted').forEach((a) => push('exam', a.examId, a.studentId, { at: a.submittedAt || a.startedAt, percent: a.percent, passed: a.passed }));

  const alerts: RiskAlert[] = [];
  groups.forEach((group, key) => {
    const rows = [...group.rows].sort((a, b) => a.at.localeCompare(b.at));
    const failed = rows.filter((row) => !row.passed).length;
    if (failed < threshold) return;
    const quiz = group.kind === 'quiz' ? quizzes.find((q) => q.id === group.assessmentId) : undefined;
    const exam = group.kind === 'exam' ? exams.find((e) => e.id === group.assessmentId) : undefined;
    const courseId = quiz?.courseId || exam?.courseId || '';
    if (!courseId || (courseIds && !courseIds.has(courseId))) return;
    const person = people.get(group.studentId);
    const passedRow = rows.find((row) => row.passed);
    const base = (group.kind === 'exam' ? exam?.maxAttempts : (quiz as { maxAttempts?: number } | undefined)?.maxAttempts) || 0;
    const extra = Math.max(0, Number(extraAll[group.studentId]?.[`${group.kind}:${group.assessmentId}`]) || 0);
    alerts.push({
      key, kind: group.kind, assessmentId: group.assessmentId,
      assessmentTitle: quiz?.title || exam?.title || 'Removed assessment',
      courseId, courseTitle: quiz?.courseTitle || exam?.courseTitle || '', lessonTitle: quiz?.lessonTitle || exam?.lessonTitle || '',
      studentId: group.studentId, studentName: person?.name || '', studentEmail: person?.email || '',
      failed, passMark: quiz?.passMark ?? exam?.passMark ?? 0,
      attempts: rows.map((row, index) => ({ n: index + 1, percent: row.percent, passed: row.passed, at: row.at })),
      status: passedRow ? 'resolved' : 'open', resolvedAt: passedRow?.at || '',
      limit: base ? base + extra : 0, extra,
      restricted: Boolean(restrictAll[group.studentId]?.[courseId]),
      actions: actions.filter((item) => item.alertKey === key).sort((a, b) => b.at.localeCompare(a.at)),
    });
  });
  return alerts.sort((a, b) => (a.status === b.status ? (b.attempts.at(-1)?.at || '').localeCompare(a.attempts.at(-1)?.at || '') : a.status === 'open' ? -1 : 1));
}

/** Records an admin intervention (with who and when) and applies its effect. */
export async function performAction(input: { alertKey: string; action: RiskActionKind; note: string; extra?: number; by: { id: string; name: string } }, courseIds: Set<string> | null) {
  const alert = (await riskAlerts(courseIds)).find((item) => item.key === input.alertKey);
  if (!alert) throw new Error('Risk alert not found.');
  if (!RISK_ACTIONS.some((item) => item.key === input.action)) throw new Error('Unknown action.');
  const note = String(input.note || '').trim().slice(0, 800);
  const now = new Date().toISOString();
  const label = RISK_ACTIONS.find((item) => item.key === input.action)!.label;
  let extra = 0;
  if (input.action === 'extra-attempts') {
    extra = Math.round(Number(input.extra) || 0);
    if (!(extra >= 1 && extra <= 10)) throw new Error('Choose between 1 and 10 extra attempts.');
    await addExtraAttempts(alert.studentId, alert.kind, alert.assessmentId, extra);
  } else if (input.action === 'restrict-exams') {
    await setRestriction(alert.studentId, alert.courseId, { by: input.by.name, at: now, note });
  } else if (input.action === 'lift-restriction') {
    await setRestriction(alert.studentId, alert.courseId, null);
  } else if (input.action === 'contact' || input.action === 'warning' || input.action === 'study') {
    if (!note) throw new Error('Write the message the student will see.');
    await addNotice(alert.studentId, { id: uid('note'), kind: input.action, text: note, by: input.by.name, courseId: alert.courseId, at: now });
  } else if (input.action === 'instructor-support' && !note) {
    throw new Error('Write who will support the student.');
  }
  const record: RiskAction = { id: uid('act'), alertKey: alert.key, action: input.action, note: note || label, extra, byId: input.by.id, byName: input.by.name, at: now };
  await kvSet(ACTIONS_KEY, [record, ...(await listActions())].slice(0, 5000));
  return record;
}
