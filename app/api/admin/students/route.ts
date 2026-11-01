import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { createProfile, hashPassword, listProfiles, normalizeEmail, profileByEmail, profileById, updateProfile } from '@/lib/accounts';
import { allEnrollments, grantEnrollment, listPayments, revokeEnrollment, savePayment } from '@/lib/payments';
import { allStudentDetails, emptyDetails, saveStudentDetails } from '@/lib/students';
import { coursePrice } from '@/lib/course-pricing';
import { listAttempts } from '@/lib/quizzes';
import { attemptsFor } from '@/lib/exams';
import { listAssignments, listSubmissions } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

const newPassword = () => crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) + Math.floor(10 + Math.random() * 89);

async function studentList() {
  const [profiles, details, enrollments, payments] = await Promise.all([listProfiles(), allStudentDetails(), allEnrollments(), listPayments()]);
  return profiles
    .filter((profile) => profile.roles.includes('Student'))
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      disabled: profile.disabled,
      createdAt: profile.created_at,
      details: { ...emptyDetails(), ...details[profile.id] },
      courseIds: enrollments[profile.id] || [],
      paid: payments.filter((payment) => payment.studentId === profile.id && (payment.status === 'paid' || payment.status === 'approved')).reduce((sum, payment) => sum + payment.amount, 0),
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

// GET → all students; GET ?id → one student's full record (payments and results).
export async function GET(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!id) return NextResponse.json({ success: true, students: await studentList() });

  const [payments, quizAttempts, examAttempts, submissions, assignments] = await Promise.all([listPayments(), listAttempts(id), attemptsFor(id), listSubmissions(), listAssignments()]);
  return NextResponse.json({
    success: true,
    payments: payments.filter((payment) => payment.studentId === id),
    quizAttempts,
    examAttempts: examAttempts.filter((attempt) => attempt.status === 'submitted'),
    submissions: submissions.filter((item) => item.studentId === id).map((item) => ({ ...item, assignmentTitle: assignments.find((a) => a.id === item.assignmentId)?.title || 'Assignment', maxScore: assignments.find((a) => a.id === item.assignmentId)?.maxScore || 100 })),
  });
}

type EnrollInput = { courseId: string; payment: 'paid' | 'free'; method?: string; amount?: number; transactionId?: string };

async function enroll(student: { id: string; name: string; email: string }, input: EnrollInput) {
  const price = await coursePrice(String(input.courseId || ''));
  if (!price) throw new Error('That course is not available.');
  if (input.payment === 'paid') {
    // Recording the payment as approved also opens the course.
    await savePayment({
      studentId: student.id, studentName: student.name, studentEmail: student.email,
      courseId: price.courseId, courseTitle: price.title,
      amount: Number(input.amount) >= 0 && input.amount !== undefined ? Number(input.amount) : price.amount,
      method: String(input.method || 'Cash'), transactionId: String(input.transactionId || ''),
      status: 'approved', source: 'manual',
    });
  } else {
    await grantEnrollment(student.id, price.courseId);
  }
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();

    if (body.action === 'create') {
      const name = String(body.name || '').trim();
      const email = normalizeEmail(String(body.email || ''));
      const phone = String(body.phone || '').replace(/[^\d+]/g, '');
      if (!name) throw new Error('Enter the student’s full name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
      if (phone.length < 11) throw new Error('Enter a valid phone number.');
      if (await profileByEmail(email)) throw new Error('An account with this email already exists.');
      const password = String(body.password || '').trim() || newPassword();
      if (password.length < 6) throw new Error('The password must be at least 6 characters.');
      const profile = await createProfile({ email, name, password, role: 'Student', phone });
      await saveStudentDetails(profile.id, body.details || {});
      for (const item of (Array.isArray(body.enrollments) ? body.enrollments : []) as EnrollInput[]) await enroll(profile, item);
      return NextResponse.json({ success: true, studentId: profile.id, password: body.password ? null : password, students: await studentList() });
    }

    const profile = await profileById(String(body.id || ''));
    if (!profile || !profile.roles.includes('Student')) throw new Error('Student not found.');

    if (body.action === 'update') {
      const name = String(body.name ?? profile.name).trim();
      const phone = String(body.phone ?? profile.phone ?? '').replace(/[^\d+]/g, '');
      if (!name) throw new Error('Enter the student’s full name.');
      await updateProfile(profile.id, { name, phone });
      await saveStudentDetails(profile.id, body.details || {});
    } else if (body.action === 'enroll') {
      await enroll(profile, body as EnrollInput);
    } else if (body.action === 'unenroll') {
      await revokeEnrollment(profile.id, String(body.courseId || ''));
    } else if (body.action === 'disable') {
      await updateProfile(profile.id, { disabled: Boolean(body.disabled) });
    } else if (body.action === 'reset-password') {
      const password = newPassword();
      await updateProfile(profile.id, { password_hash: hashPassword(password) });
      return NextResponse.json({ success: true, password, students: await studentList() });
    } else {
      throw new Error('Unknown action.');
    }
    return NextResponse.json({ success: true, students: await studentList() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the student.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
