import fs from 'fs';
import { dataPath } from '@/lib/data-dir';
import { kvGet, kvSet } from '@/lib/kv-store';
import { getOffer, type ServiceOffer } from '@/lib/service-catalog';

export type RequestStatus = 'new' | 'progress' | 'done';
export type RequestMessage = { id: string; from: 'customer' | 'admin'; text: string; at: string };

export type ServiceRequest = {
  id: string;
  planId: string;
  planName: string;
  price: number;
  period: ServiceOffer['period'];
  name: string;
  phone: string;
  email: string;
  message: string;
  status: RequestStatus;
  thread: RequestMessage[];
  createdAt: string;
};

// Requests live in kv-store (Supabase app_kv on Vercel, a local file in development).
const KEY = 'service-requests';
// Older local installs kept requests in data/service-requests.json; read it once as a starting point.
const LEGACY_FILE = dataPath('service-requests.json');

function readLegacyFile(): ServiceRequest[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readAll(): Promise<ServiceRequest[]> {
  return (await kvGet<ServiceRequest[] | null>(KEY, null)) ?? readLegacyFile();
}

async function writeAll(list: ServiceRequest[]) {
  await kvSet(KEY, list);
}

function asStatus(value: unknown): RequestStatus {
  return value === 'progress' || value === 'done' ? value : 'new';
}

function normalizeRequest(item: ServiceRequest): ServiceRequest {
  const thread = item.thread?.length
    ? item.thread
    : [{ id: `${item.id}-opening`, from: 'customer' as const, text: item.message || '', at: item.createdAt }];
  return { ...item, status: asStatus(item.status), thread };
}

export async function createServiceRequest(input: {
  planId: string;
  billing?: 'month' | 'year' | 'once';
  name: string;
  phone: string;
  email: string;
  message: string;
}): Promise<ServiceRequest> {
  const offer = getOffer(input.planId);
  if (!offer) {
    throw new Error('Unknown service');
  }

  const billing = offer.period === 'once' ? 'once' : input.billing === 'year' ? 'year' : 'month';
  const price = billing === 'year' ? Math.round(offer.price * 12 * 0.8) : offer.price;

  const createdAt = new Date().toISOString();
  const message = input.message.trim();
  const record: ServiceRequest = {
    id: `req-${Date.now()}`,
    planId: offer.id,
    planName: offer.name,
    price,
    period: billing,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    message,
    status: 'new',
    thread: [{ id: `msg-${Date.now()}`, from: 'customer', text: message, at: createdAt }],
    createdAt,
  };

  await writeAll([record, ...(await readAll()).filter((item) => item.id !== record.id)]);
  return record;
}

export async function listServiceRequests(): Promise<ServiceRequest[]> {
  return (await readAll())
    .map((item) => normalizeRequest(item))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getServiceRequest(id: string) {
  const list = await listServiceRequests();
  return list.find((item) => item.id === id) || null;
}

export async function updateServiceRequest(
  id: string,
  patch: Partial<Pick<ServiceRequest, 'name' | 'phone' | 'email' | 'message' | 'status'>>
) {
  const list = (await listServiceRequests()).map((item) => {
    if (item.id !== id) return item;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
    const next = { ...item, ...clean } as ServiceRequest;
    if (typeof patch.message === 'string' && next.thread[0]?.from === 'customer') {
      next.thread = [{ ...next.thread[0], text: patch.message }, ...next.thread.slice(1)];
    }
    return next;
  });
  if (!list.some((item) => item.id === id)) throw new Error('Request not found.');
  await writeAll(list);
  return list.find((item) => item.id === id)!;
}

export async function replyToServiceRequest(id: string, from: 'admin' | 'customer', text: string, email?: string) {
  const clean = text.trim();
  if (!clean) throw new Error('Write a message first.');
  const current = await getServiceRequest(id);
  if (!current) throw new Error('Request not found.');
  if (from === 'customer' && email && current.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error('This request belongs to another email.');
  }
  const message: RequestMessage = { id: `msg-${Date.now()}`, from, text: clean, at: new Date().toISOString() };
  const status: RequestStatus = from === 'admin' && current.status === 'new' ? 'progress' : current.status;
  const next: ServiceRequest = { ...current, status, thread: [...current.thread, message] };

  const list = (await listServiceRequests()).map((item) => (item.id === id ? next : item));
  await writeAll(list);
  return next;
}

export async function deleteServiceRequest(id: string) {
  const list = (await listServiceRequests()).filter((item) => item.id !== id);
  await writeAll(list);
}
