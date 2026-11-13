import fs from 'fs';
import path from 'path';
import { dataPath } from '@/lib/data-dir';
import { kvGet, kvSet } from '@/lib/kv-store';

export interface CertificateRecord {
  certificateId: string;
  studentName: string;
  studentEmail?: string;
  courseTitle: string;
  courseId: string;
  issueDate: string;
  grade: string;
  instructorName: string;
  verificationUrl: string;
  createdAt: string;
  status: 'VALID' | 'REVOKED';
  verified: boolean;
}

const LOCAL_CERTIFICATES_KEY = 'english_capsules_certificate_registry';
const SERVER_DATA_DIR = dataPath();
const SERVER_CERTS_FILE = path.join(SERVER_DATA_DIR, 'certificates.json');

// No built-in demo certificates: only certificates actually issued can be verified.
const seedCertificates: Record<string, CertificateRecord> = {};

// Issued certificates live in kv-store (Supabase app_kv on Vercel, a local file in development).
// Older local installs kept them in data/certificates.json; that file is read once as a starting point.
const CERTS_KEY = 'certificates';

function loadLegacyCertFile(): Record<string, CertificateRecord> {
  try {
    if (fs.existsSync(SERVER_CERTS_FILE)) {
      return JSON.parse(fs.readFileSync(SERVER_CERTS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Could not read certificates.json', err);
  }
  return { ...seedCertificates };
}

async function loadCertStore(): Promise<Record<string, CertificateRecord>> {
  return (await kvGet<Record<string, CertificateRecord> | null>(CERTS_KEY, null)) ?? loadLegacyCertFile();
}

/**
 * Generates a unique, random alphanumeric Certificate ID (e.g. CBS-2026-K9P2W7)
 */
export function generateUniqueCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CBS-${new Date().getFullYear()}-${token}`;
}

/**
 * Saves a new certificate record into database and shared persistent store.
 */
export async function saveCertificateRecord(record: CertificateRecord): Promise<CertificateRecord> {
  const normalizedId = record.certificateId.trim().toUpperCase();
  const certToSave: CertificateRecord = {
    ...record,
    certificateId: normalizedId,
    verified: true,
    status: 'VALID',
    createdAt: record.createdAt || new Date().toISOString(),
  };

  // 1. Save to the shared store
  const store = await loadCertStore();
  store[normalizedId] = certToSave;
  await kvSet(CERTS_KEY, store);

  // 2. Save to localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
      const store = raw ? JSON.parse(raw) : { ...seedCertificates };
      store[normalizedId] = certToSave;
      localStorage.setItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(store));
    } catch {}
  }


  return certToSave;
}

/**
 * The certificate already issued to this student for this course, if any.
 */
export async function findCertificate(email: string, courseId: string): Promise<CertificateRecord | null> {
  const store = await loadCertStore();
  const wanted = email.trim().toLowerCase();
  return (
    Object.values(store).find(
      (cert) => (cert.studentEmail || '').toLowerCase() === wanted && String(cert.courseId) === String(courseId)
    ) || null
  );
}

/**
 * Queries the database for a certificate by its unique alphanumeric ID.
 */
export async function revokeCertificateRecord(certificateId: string) {
  const store = await loadCertStore();
  const key = certificateId.trim().toUpperCase();
  if (!store[key]) return;
  store[key] = { ...store[key], status: 'REVOKED' };
  await kvSet(CERTS_KEY, store);
}

export async function getCertificateById(certificateId: string): Promise<CertificateRecord | null> {
  if (!certificateId) return null;
  const normalizedId = certificateId.trim().toUpperCase();

  // 1. Check the shared store
  const store = await loadCertStore();
  if (store[normalizedId]) {
    return store[normalizedId];
  }

  // 2. Check localStorage in browser
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        if (store[normalizedId]) {
          return store[normalizedId];
        }
      }
    } catch {}
  }


  // 3. Check seed certificates
  if (seedCertificates[normalizedId]) {
    return seedCertificates[normalizedId];
  }

  return null;
}
