import { kvGet, kvSet } from '@/lib/kv-store';

// Extra admin-managed details for student accounts (the login itself lives in profiles).
export type StudentStatus = 'Active' | 'Paused' | 'Completed' | 'Dropped';

export type StudentDetails = {
  studentCode: string; // e.g. CBS-STU-0007
  dateOfBirth: string;
  gender: '' | 'Male' | 'Female' | 'Other';
  address: string;
  city: string;
  institution: string;
  educationLevel: string;
  occupation: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  status: StudentStatus;
  source: string;
  notes: string;
  updatedAt: string;
};

const KEY = 'student-details';
const STATUSES: StudentStatus[] = ['Active', 'Paused', 'Completed', 'Dropped'];

export const emptyDetails = (): StudentDetails => ({
  studentCode: '', dateOfBirth: '', gender: '', address: '', city: '', institution: '', educationLevel: '', occupation: '',
  guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '', status: 'Active', source: '', notes: '', updatedAt: '',
});

export async function allStudentDetails(): Promise<Record<string, StudentDetails>> {
  return kvGet<Record<string, StudentDetails>>(KEY, {});
}

const clean = (value: unknown, max = 200) => String(value ?? '').trim().slice(0, max);

/** Saves details for one student, giving them a student code the first time. */
export async function saveStudentDetails(studentId: string, input: Partial<StudentDetails>) {
  const all = await allStudentDetails();
  const current = all[studentId] || emptyDetails();
  let studentCode = current.studentCode;
  if (!studentCode) {
    const highest = Object.values(all).reduce((max, item) => Math.max(max, Number(item.studentCode?.split('-').pop()) || 0), 0);
    studentCode = `CBS-STU-${String(highest + 1).padStart(4, '0')}`;
  }
  const dob = clean(input.dateOfBirth ?? current.dateOfBirth, 10);
  const next: StudentDetails = {
    studentCode,
    dateOfBirth: /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : '',
    gender: (['Male', 'Female', 'Other'] as const).includes(input.gender as 'Male') ? (input.gender as StudentDetails['gender']) : input.gender === '' ? '' : current.gender,
    address: clean(input.address ?? current.address, 300),
    city: clean(input.city ?? current.city, 80),
    institution: clean(input.institution ?? current.institution),
    educationLevel: clean(input.educationLevel ?? current.educationLevel, 80),
    occupation: clean(input.occupation ?? current.occupation, 120),
    guardianName: clean(input.guardianName ?? current.guardianName, 120),
    guardianRelation: clean(input.guardianRelation ?? current.guardianRelation, 40),
    guardianPhone: clean(input.guardianPhone ?? current.guardianPhone, 20),
    guardianEmail: clean(input.guardianEmail ?? current.guardianEmail, 120),
    status: STATUSES.includes(input.status as StudentStatus) ? (input.status as StudentStatus) : current.status,
    source: clean(input.source ?? current.source, 60),
    notes: clean(input.notes ?? current.notes, 3000),
    updatedAt: new Date().toISOString(),
  };
  await kvSet(KEY, { ...all, [studentId]: next });
  return next;
}
