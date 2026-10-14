import fs from 'fs';
import path from 'path';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOffer, type ServiceOffer } from '@/lib/service-catalog';

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
  createdAt: string;
};

const FILE_PATH = path.join(process.cwd(), 'data', 'service-requests.json');
const COLLECTION = 'serviceRequests';

const isDemoMode = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyForLearnVerseLMSApp123';
  return apiKey.startsWith('AIzaSyDemo');
};

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
  name: string;
  phone: string;
  email: string;
  message: string;
}): Promise<ServiceRequest> {
  const offer = getOffer(input.planId);
  if (!offer) {
    throw new Error('Unknown service');
  }

  const record: ServiceRequest = {
    id: `req-${Date.now()}`,
    planId: offer.id,
    planName: offer.name,
    price: offer.price,
    period: offer.period,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
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
    createdAt: serverTimestamp(),
  });

  return { ...record, id: docRef.id };
}

export async function listServiceRequests(): Promise<ServiceRequest[]> {
  if (isDemoMode()) {
    const fromFile = readFileRequests();
    if (fromFile.length > 0) return fromFile;
    return memoryStore();
  }

  const snap = await getDocs(collection(db, COLLECTION));
  const list: ServiceRequest[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      planId: String(data.planId || ''),
      planName: String(data.planName || ''),
      price: Number(data.price || 0),
      period: data.period === 'once' ? 'once' : 'month',
      name: String(data.name || ''),
      phone: String(data.phone || ''),
      email: String(data.email || ''),
      message: String(data.message || ''),
      createdAt: toIso(data.createdAt),
    });
  });

  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
