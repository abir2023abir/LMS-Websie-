import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments, listPayments } from '@/lib/payments';

export const dynamic = 'force-dynamic';

// The signed-in student's paid/approved courses, plus payments still waiting for approval.
export async function GET() {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const [courseIds, payments] = await Promise.all([getEnrollments(profile.id), listPayments()]);
  const pending = payments
    .filter((payment) => payment.studentId === profile.id && payment.status === 'pending')
    .map((payment) => ({ id: payment.id, courseId: payment.courseId, courseTitle: payment.courseTitle, method: payment.method, amount: payment.amount, createdAt: payment.createdAt }));
  return NextResponse.json({ success: true, courseIds, pending });
}
