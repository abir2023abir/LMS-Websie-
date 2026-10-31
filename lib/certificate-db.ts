import fs from 'fs';
import path from 'path';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dataPath } from '@/lib/data-dir';
import { isFirebaseDemo } from '@/lib/utils';

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

// Helper to load file store
function loadFileCertStore(): Record<string, CertificateRecord> {
  try {
    if (fs.existsSync(SERVER_CERTS_FILE)) {
      const raw = fs.readFileSync(SERVER_CERTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read certificates.json', err);
  }
  return { ...seedCertificates };
}

// Helper to save file store
function saveFileCertStore(store: Record<string, CertificateRecord>) {
  try {
    if (!fs.existsSync(SERVER_DATA_DIR)) {
      fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SERVER_CERTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write certificates.json', err);
  }
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

  // 1. Save to server persistent filesystem
  const fileStore = loadFileCertStore();
  fileStore[normalizedId] = certToSave;
  saveFileCertStore(fileStore);

  // 2. Save to localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_CERTIFICATES_KEY);
      const store = raw ? JSON.parse(raw) : { ...seedCertificates };
      store[normalizedId] = certToSave;
      localStorage.setItem(LOCAL_CERTIFICATES_KEY, JSON.stringify(store));
    } catch {}
  }

  // 3. Persist to Firestore if real keys configured
  try {
    if (!isFirebaseDemo()) {
      const docRef = doc(db, 'certificates', normalizedId);
      await setDoc(docRef, {
        ...certToSave,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn('[Certificate DB] Firestore sync skipped in sandbox/offline mode:', error);
  }

  return certToSave;
}

/**
 * Queries the database for a certificate by its unique alphanumeric ID.
 */
export async function getCertificateById(certificateId: string): Promise<CertificateRecord | null> {
  if (!certificateId) return null;
  const normalizedId = certificateId.trim().toUpperCase();

  // 1. Check persistent server file store
  const fileStore = loadFileCertStore();
  if (fileStore[normalizedId]) {
    return fileStore[normalizedId];
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

  // 3. Query Firestore certificates collection
  try {
    if (!isFirebaseDemo()) {
      const docRef = doc(db, 'certificates', normalizedId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CertificateRecord;
        return data;
      }
    }
  } catch (error) {
    console.warn('[Certificate DB] Error querying Firestore:', error);
  }

  // 4. Check seed certificates
  if (seedCertificates[normalizedId]) {
    return seedCertificates[normalizedId];
  }

  return null;
}
