import { kvGet, kvSet } from '@/lib/kv-store';

/* ─────────────────────────────────────────────
   Payment settings (admin → Payments)
───────────────────────────────────────────── */
export type ManualMethodId = 'bkash' | 'nagad' | 'rocket';

export type ManualMethod = {
  enabled: boolean;
  number: string;
  accountType: 'Personal' | 'Agent' | 'Merchant';
};

export type PaymentSettings = {
  ssl: { enabled: boolean; storeId: string; storePassword: string; live: boolean };
  manual: Record<ManualMethodId, ManualMethod>;
  manualInstructions: string;
};

export const manualMethodLabels: Record<ManualMethodId, string> = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' };

const emptyManual = (): ManualMethod => ({ enabled: false, number: '', accountType: 'Personal' });

// .env values seed the form; placeholders like "your_store_id" are ignored. SSLCommerz stays
// off until the admin switches it on in Payments.
const envValue = (value?: string) => (value && !/^your[_-]/i.test(value) ? value : '');

export const defaultPaymentSettings: PaymentSettings = {
  ssl: {
    enabled: false,
    storeId: envValue(process.env.SSLCOMMERZ_STORE_ID),
    storePassword: envValue(process.env.SSLCOMMERZ_STORE_PASSWORD),
    live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  },
  manual: { bkash: emptyManual(), nagad: emptyManual(), rocket: emptyManual() },
  manualInstructions: 'Use "Send Money" to the number below, then enter your sender number and Transaction ID. Your course opens as soon as we confirm the payment.',
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const saved = await kvGet<Partial<PaymentSettings>>('payment-settings', {});
  return {
    ssl: { ...defaultPaymentSettings.ssl, ...saved.ssl },
    manual: {
      bkash: { ...emptyManual(), ...saved.manual?.bkash },
      nagad: { ...emptyManual(), ...saved.manual?.nagad },
      rocket: { ...emptyManual(), ...saved.manual?.rocket },
    },
    manualInstructions: saved.manualInstructions ?? defaultPaymentSettings.manualInstructions,
  };
}

export async function savePaymentSettings(next: PaymentSettings) {
  await kvSet('payment-settings', next);
}

/** What students may see: enabled methods and receiving numbers, never the SSLCommerz password. */
export async function publicPaymentMethods() {
  const settings = await getPaymentSettings();
  const ssl = settings.ssl.enabled && Boolean(settings.ssl.storeId && settings.ssl.storePassword);
  const manual = (Object.keys(settings.manual) as ManualMethodId[])
    .filter((id) => settings.manual[id].enabled && settings.manual[id].number.trim())
    .map((id) => ({ id, label: manualMethodLabels[id], number: settings.manual[id].number.trim(), accountType: settings.manual[id].accountType }));
  return { ssl, manual, manualInstructions: settings.manualInstructions };
}

/* ─────────────────────────────────────────────
   Payment records
───────────────────────────────────────────── */
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'failed';

export type PaymentRecord = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId: string;
  senderNumber: string;
  screenshot: string; // proof id, '' when none
  source: 'sslcommerz' | 'manual';
  createdAt: string;
  updatedAt: string;
};

const PAYMENTS_KEY = 'payments';

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export async function listPayments(): Promise<PaymentRecord[]> {
  const list = await kvGet<PaymentRecord[]>(PAYMENTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

async function writePayments(list: PaymentRecord[]) {
  await kvSet(PAYMENTS_KEY, list);
}

export async function findPayment(predicate: (payment: PaymentRecord) => boolean) {
  return (await listPayments()).find(predicate) || null;
}

const grantsAccess = (status: PaymentStatus) => status === 'paid' || status === 'approved';

export async function savePayment(input: Partial<PaymentRecord> & { studentName: string; courseTitle: string }): Promise<PaymentRecord> {
  const list = await listPayments();
  const existing = input.id ? list.find((item) => item.id === input.id) : undefined;
  const now = new Date().toISOString();
  const source = input.source || existing?.source || 'manual';
  const record: PaymentRecord = {
    id: existing?.id || input.id || uid('pay'),
    studentId: input.studentId ?? existing?.studentId ?? '',
    studentName: input.studentName.trim(),
    studentEmail: (input.studentEmail ?? existing?.studentEmail ?? '').trim(),
    courseId: input.courseId ?? existing?.courseId ?? '',
    courseTitle: input.courseTitle.trim(),
    amount: Number(input.amount ?? existing?.amount) || 0,
    method: (input.method ?? existing?.method ?? '').trim() || (source === 'sslcommerz' ? 'SSLCommerz' : 'Personal bKash'),
    status: input.status || existing?.status || 'pending',
    transactionId: (input.transactionId ?? existing?.transactionId ?? '').trim(),
    senderNumber: (input.senderNumber ?? existing?.senderNumber ?? '').trim(),
    screenshot: input.screenshot ?? existing?.screenshot ?? '',
    source,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  if (!record.studentName || !record.courseTitle) throw new Error('Student and course are required.');
  await writePayments(existing ? list.map((item) => (item.id === record.id ? record : item)) : [record, ...list]);
  if (grantsAccess(record.status) && record.studentId && record.courseId) await grantEnrollment(record.studentId, record.courseId);
  return record;
}

export async function setPaymentStatus(id: string, status: PaymentStatus) {
  const list = await listPayments();
  const payment = list.find((item) => item.id === id);
  if (!payment) throw new Error('Payment not found.');
  return savePayment({ ...payment, status });
}

export async function deletePayment(id: string) {
  const list = await listPayments();
  const payment = list.find((item) => item.id === id);
  await writePayments(list.filter((item) => item.id !== id));
  if (payment?.screenshot) await kvSet(`payment-proof-${payment.screenshot}`, null);
}

/* Screenshots are kept as data URLs under their own key so the payment list stays small. */
const MAX_PROOF_BYTES = 3 * 1024 * 1024;
const PROOF_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export async function saveProof(file: File): Promise<string> {
  if (!PROOF_TYPES.has(file.type)) throw new Error('Screenshot must be a PNG, JPG, WEBP or GIF image.');
  if (file.size > MAX_PROOF_BYTES) throw new Error('Screenshot must be 3 MB or smaller.');
  const id = uid('proof');
  const dataUrl = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;
  await kvSet(`payment-proof-${id}`, dataUrl);
  return id;
}

export async function readProof(id: string): Promise<{ type: string; bytes: Buffer } | null> {
  const dataUrl = await kvGet<string | null>(`payment-proof-${id.replace(/[^a-z0-9-]/gi, '')}`, null);
  const match = dataUrl?.match(/^data:([^;]+);base64,(.+)$/);
  return match ? { type: match[1], bytes: Buffer.from(match[2], 'base64') } : null;
}

/* ─────────────────────────────────────────────
   Enrollments (student id → course ids)
───────────────────────────────────────────── */
const ENROLLMENTS_KEY = 'enrollments';

export async function getEnrollments(studentId: string): Promise<string[]> {
  const all = await kvGet<Record<string, string[]>>(ENROLLMENTS_KEY, {});
  return all[studentId] || [];
}

export async function grantEnrollment(studentId: string, courseId: string) {
  const all = await kvGet<Record<string, string[]>>(ENROLLMENTS_KEY, {});
  const current = all[studentId] || [];
  if (current.includes(courseId)) return;
  await kvSet(ENROLLMENTS_KEY, { ...all, [studentId]: [...current, courseId] });
}
