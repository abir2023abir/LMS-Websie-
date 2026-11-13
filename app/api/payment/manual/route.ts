import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { courseIsFull, findPayment, getEnrollments, manualMethodLabels, publicPaymentMethods, saveProof, savePayment, type ManualMethodId } from '@/lib/payments';
import { coursePrice } from '@/lib/course-pricing';
import { enrollmentClosedReason } from '@/lib/course-timeline';

export const dynamic = 'force-dynamic';

// A student reports a bKash / Nagad / Rocket "Send Money" payment. It stays pending
// until an admin checks it in Payments and approves it, which opens the course.
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const form = await request.formData();
    const courseId = String(form.get('courseId') || '');
    const methodId = String(form.get('method') || '') as ManualMethodId;
    const senderNumber = String(form.get('senderNumber') || '').replace(/[^\d+]/g, '');
    const transactionId = String(form.get('transactionId') || '').trim().toUpperCase();
    const screenshot = form.get('screenshot');

    const methods = await publicPaymentMethods();
    const method = methods.manual.find((item) => item.id === methodId);
    if (!method) return NextResponse.json({ success: false, message: 'This payment method is not available.' }, { status: 400 });
    if (senderNumber.length < 11) return NextResponse.json({ success: false, message: 'Enter the number you sent the money from.' }, { status: 400 });
    if (!/^[A-Z0-9]{6,20}$/.test(transactionId)) return NextResponse.json({ success: false, message: 'Enter the Transaction ID from your payment message.' }, { status: 400 });

    const price = await coursePrice(courseId);
    if (!price) return NextResponse.json({ success: false, message: 'This course is not available for purchase.' }, { status: 404 });
    if ((await getEnrollments(profile.id)).includes(courseId)) return NextResponse.json({ success: false, message: 'You are already enrolled in this course.' }, { status: 409 });
    if (await courseIsFull(courseId)) return NextResponse.json({ success: false, message: 'This course is full. 100,000 students are already enrolled.' }, { status: 403 });
    const closed = await enrollmentClosedReason(courseId);
    if (closed) return NextResponse.json({ success: false, message: closed }, { status: 403 });
    if (await findPayment((payment) => payment.transactionId === transactionId && payment.source === 'manual')) {
      return NextResponse.json({ success: false, message: 'This Transaction ID has already been submitted.' }, { status: 409 });
    }

    const proof = screenshot instanceof File && screenshot.size > 0 ? await saveProof(screenshot) : '';
    const payment = await savePayment({
      studentId: profile.id,
      studentName: profile.name || profile.email,
      studentEmail: profile.email,
      courseId,
      courseTitle: price.title,
      amount: price.amount,
      method: `${method.accountType} ${manualMethodLabels[method.id]}`,
      status: 'pending',
      transactionId,
      senderNumber,
      screenshot: proof,
      source: 'manual',
    });
    return NextResponse.json({ success: true, paymentId: payment.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not submit the payment.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
