import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

const PAYMENT_METHODS = new Set(['BKASH', 'NAGAD', 'CARD', 'SSLCOMMERZ']);

/**
 * Local checkout simulation. This endpoint deliberately does not contact a gateway
 * or claim that a real payment was received.
 */
export async function POST(request: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Sign in with a student account before enrolling.' }, { status: 401 });
    }
    if (!profile.roles.includes('Student')) {
      return NextResponse.json({ success: false, error: 'Course enrollment requires a student account.' }, { status: 403 });
    }

    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    const courseTitle = String(body.courseTitle || '').trim();
    const paymentMethod = String(body.paymentMethod || '').toUpperCase();
    const amount = Number(body.amount);
    if (!courseId || !courseTitle) {
      return NextResponse.json({ success: false, error: 'Choose a course before checkout.' }, { status: 400 });
    }
    if (!PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json({ success: false, error: 'Choose one of the listed payment methods.' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ success: false, error: 'The course amount is invalid.' }, { status: 400 });
    }
    if (body.userId && body.userId !== profile.id) {
      return NextResponse.json({ success: false, error: 'The signed-in student does not match this checkout.' }, { status: 403 });
    }

    const transactionId = `DEMO_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    return NextResponse.json({
      success: true,
      mode: 'demo',
      status: 'DEMO',
      message: 'Test enrollment completed. No payment provider was contacted and no charge was made.',
      transactionId,
      paymentMethod,
      courseId,
      amount,
    });
  } catch (error: any) {
    console.error('API POST /api/checkout Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Checkout simulation failed.' }, { status: 500 });
  }
}
