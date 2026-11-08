import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments, publicPaymentMethods, savePayment } from '@/lib/payments';
import { coursePrice } from '@/lib/course-pricing';
import { enrollmentClosedReason } from '@/lib/course-timeline';
import { siteUrl, startSslSession } from '@/lib/sslcommerz';

export const dynamic = 'force-dynamic';

// Starts an SSLCommerz checkout (bKash, Nagad, Rocket, cards) for the signed-in student.
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const { courseId } = (await request.json()) as { courseId?: string };
    if (!(await publicPaymentMethods()).ssl) {
      return NextResponse.json({ success: false, message: 'Online payment is not available right now.' }, { status: 503 });
    }
    const price = await coursePrice(String(courseId || ''));
    if (!price) return NextResponse.json({ success: false, message: 'This course is not available for purchase.' }, { status: 404 });
    if ((await getEnrollments(profile.id)).includes(price.courseId)) {
      return NextResponse.json({ success: false, message: 'You are already enrolled in this course.' }, { status: 409 });
    }
    const closed = await enrollmentClosedReason(price.courseId);
    if (closed) return NextResponse.json({ success: false, message: closed }, { status: 403 });
    if (price.amount <= 0) return NextResponse.json({ success: false, message: 'This course is free — no payment is needed.' }, { status: 400 });

    const payment = await savePayment({
      studentId: profile.id,
      studentName: profile.name || profile.email,
      studentEmail: profile.email,
      courseId: price.courseId,
      courseTitle: price.title,
      amount: price.amount,
      method: 'SSLCommerz',
      status: 'pending',
      transactionId: `CBS${Date.now()}${randomBytes(6).toString('hex').toUpperCase()}`,
      source: 'sslcommerz',
    });
    const url = await startSslSession(payment, profile.phone || '', siteUrl(request));
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('[payment/init]', error);
    const message = error instanceof Error ? error.message : 'Could not start the payment.';
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
