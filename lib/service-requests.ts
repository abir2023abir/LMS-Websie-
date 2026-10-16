import fs from 'fs';
import path from 'path';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dataPath } from '@/lib/data-dir';
import { isFirebaseDemo } from '@/lib/utils';
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

const FILE_PATH = dataPath('service-requests.json');
const COLLECTION = 'serviceRequests';

const isDemoMode = isFirebaseDemo;

function memoryStore(): ServiceRequest[] {
  const g = globalThis as typeof globalThis & { __serviceRequests?: ServiceRequest[] };
  if (!g.__serviceRequests) g.__serviceRequests = [];
  return g.__serviceRequests;
}

function readFileRequests(): ServiceRequest[] {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFileRequests(list: ServiceRequest[]) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2));
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

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
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

  if (isDemoMode()) {
    const list = [record, ...readFileRequests().filter((item) => item.id !== record.id)];
    try {
      writeFileRequests(list);
    } catch {
      memoryStore().unshift(record);
    }
    return record;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    planId: record.planId,
    planName: record.planName,
    price: record.price,
    period: record.period,
    name: record.name,
    phone: record.phone,
    email: record.email,
    message: record.message,
    status: record.status,
    thread: record.thread,
    createdAt: serverTimestamp(),
  });

  return { ...record, id: docRef.id };
}

function mapDoc(id: string, data: Record<string, unknown>): ServiceRequest {
  const createdAt = toIso(data.createdAt);
  const message = String(data.message || '');
  const thread = Array.isArray(data.thread)
    ? (data.thread as RequestMessage[])
    : [{ id: `${id}-opening`, from: 'customer' as const, text: message, at: createdAt }];
  return normalizeRequest({
    id,
    planId: String(data.planId || ''),
    planName: String(data.planName || ''),
    price: Number(data.price || 0),
    period: data.period === 'once' ? 'once' : data.period === 'year' ? 'year' : 'month',
    name: String(data.name || ''),
    phone: String(data.phone || ''),
    email: String(data.email || ''),
    message,
    status: asStatus(data.status),
    thread,
    createdAt,
  });
}

export async function listServiceRequests(): Promise<ServiceRequest[]> {
  if (isDemoMode()) {
    const fromFile = readFileRequests();
    const source = fromFile.length > 0 ? fromFile : memoryStore();
    return source.map((item) => normalizeRequest(item));
  }

  const snap = await getDocs(collection(db, COLLECTION));
  const list: ServiceRequest[] = [];
  snap.forEach((docSnap) => {
    list.push(mapDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
  });

  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function writeAll(list: ServiceRequest[]) {
  try {
    writeFileRequests(list);
  } catch {
    const memory = memoryStore();
    memory.splice(0, memory.length, ...list);
  }
}

export async function getServiceRequest(id: string) {
  const list = await listServiceRequests();
  return list.find((item) => item.id === id) || null;
}

export async function updateServiceRequest(
  id: string,
  patch: Partial<Pick<ServiceRequest, 'name' | 'phone' | 'email' | 'message' | 'status'>>
) {
  if (isDemoMode()) {
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

  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, COLLECTION, id), patch);
  const current = await getServiceRequest(id);
  if (!current) throw new Error('Request not found.');
  return current;
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

  if (isDemoMode()) {
    const list = (await listServiceRequests()).map((item) => (item.id === id ? next : item));
    await writeAll(list);
    return next;
  }

  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, COLLECTION, id), { thread: next.thread, status: next.status });
  return next;
}

export async function deleteServiceRequest(id: string) {
  if (isDemoMode()) {
    const list = (await listServiceRequests()).filter((item) => item.id !== id);
    await writeAll(list);
    return;
  }
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, COLLECTION, id));
}
