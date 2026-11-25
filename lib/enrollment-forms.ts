import { kvGet, kvSet } from '@/lib/kv-store';
import { EDUCATION_STATUSES, RELATIONS, type EnrollmentDetails } from '@/lib/enrollment-form-fields';

export type EnrollmentForm = EnrollmentDetails & {
  studentId: string;
  /** The account's sign-in email (the form's email may differ). */
  accountEmail: string;
  courseId: string;
  courseTitle: string;
  submittedAt: string;
};

const KEY = 'enrollment-forms';
const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const phoneOk = (value: string) => /^\+?\d{10,15}$/.test(value.replace(/[\s-]/g, ''));
const emailOk = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function listEnrollmentForms(): Promise<EnrollmentForm[]> {
  const list = await kvGet<EnrollmentForm[]>(KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Checks one submitted form; throws a message the student can act on. */
export function cleanDetails(input: Record<string, unknown>, paid: boolean): EnrollmentDetails {
  const details: EnrollmentDetails = {
    fullName: clean(input.fullName, 120),
    phone: clean(input.phone, 20),
    email: clean(input.email, 160).toLowerCase(),
    birthDate: /^\d{4}-\d{2}-\d{2}$/.test(clean(input.birthDate, 10)) ? clean(input.birthDate, 10) : '',
    guardianName: clean(input.guardianName, 120),
    relation: clean(input.relation, 40),
    guardianPhone: clean(input.guardianPhone, 20),
    guardianEmail: clean(input.guardianEmail, 160).toLowerCase(),
    guardianAccess: input.guardianAccess === true,
    educationStatus: clean(input.educationStatus, 40),
    classYear: clean(input.classYear, 80),
    institution: clean(input.institution, 160),
    studentRoll: clean(input.studentRoll, 60),
    learningSituation: clean(input.learningSituation, 2000),
    facebook: clean(input.facebook, 200),
    instagram: clean(input.instagram, 200),
    linkedin: clean(input.linkedin, 200),
    otherSocial: clean(input.otherSocial, 200),
    paymentMethod: paid ? clean(input.paymentMethod, 40) : '',
    paymentReference: paid ? clean(input.paymentReference, 40).toUpperCase() : '',
    consent: input.consent === true,
  };
  if (details.fullName.length < 2) throw new Error('Write the student’s full name.');
  if (!phoneOk(details.phone)) throw new Error('Write a correct phone number for the student.');
  if (!emailOk(details.email)) throw new Error('Write a correct email address for the student.');
  if (details.guardianName.length < 2) throw new Error('Write the guardian’s name.');
  if (!(RELATIONS as readonly string[]).includes(details.relation)) throw new Error('Select the guardian’s relation.');
  if (!phoneOk(details.guardianPhone)) throw new Error('Write a correct phone number for the guardian.');
  if (details.guardianEmail && !emailOk(details.guardianEmail)) throw new Error('Write a correct guardian email, or leave it empty.');
  if (!(EDUCATION_STATUSES as readonly string[]).includes(details.educationStatus)) throw new Error('Select the educational status.');
  if (paid && !details.paymentMethod) throw new Error('Select a payment method.');
  if (!details.consent) throw new Error('Tick the box to confirm that the information is correct.');
  return details;
}

/** One form per student and course; sending it again replaces the earlier one. */
export async function saveEnrollmentForm(form: EnrollmentForm) {
  const list = (await listEnrollmentForms()).filter((item) => !(item.studentId === form.studentId && item.courseId === form.courseId));
  await kvSet(KEY, [form, ...list].slice(0, 20000));
}
