import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { getCourseById } from '@/lib/db';

function isDemoKey(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !key || key.startsWith('AIzaSyDemo') || key === 'your-api-key' || key.includes('DemoKey');
}

async function processPaymentSuccess(courseId: string, email: string, tranId: string, amount?: string, studentName?: string) {
  try {
    const course = await getCourseById(courseId);
    const courseTitle = course?.title || 'English Capsule Program';
    const resolvedName = studentName || (email ? email.split('@')[0] : 'Learner');

    if (email) {
      // Trigger automated welcome & getting started email immediately
      await sendWelcomeEmail({
        toEmail: email,
        studentName: resolvedName,
        courseId,
        courseTitle,
        transactionId: tranId,
        amountPaid: amount || (course?.price ? String(course.price * 110) : '4200'),
      });
    }

    if (!isDemoKey()) {
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await addDoc(collection(db, 'transactions'), {
          courseId,
          courseTitle,
          studentEmail: email,
          studentName: resolvedName,
          transactionId: tranId,
          amount: amount || course?.price || 39,
          status: 'VALID',
          paymentMethod: 'SSLCommerz',
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('[Payment Success] Firestore sync error:', dbErr);
      }
    }
  } catch (err) {
    console.error('[Payment Success] Error processing automated communication:', err);
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let courseId = url.searchParams.get('courseId') || '1';
  let email = url.searchParams.get('email') || '';
  let tranId = url.searchParams.get('tranId') || url.searchParams.get('tran_id') || `TXN_${Date.now()}`;
  let amount = url.searchParams.get('amount') || '';
  let studentName = url.searchParams.get('name') || '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.get('tran_id')) tranId = String(formData.get('tran_id'));
      if (formData.get('cus_email')) email = String(formData.get('cus_email'));
      if (formData.get('amount')) amount = String(formData.get('amount'));
      if (formData.get('cus_name')) studentName = String(formData.get('cus_name'));
      if (formData.get('value_a')) courseId = String(formData.get('value_a'));
    }
  } catch {
    // Ignore body parse errors and fallback to query params
  }

  await processPaymentSuccess(courseId, email, tranId, amount, studentName);

  const host = request.headers.get('host') || 'localhost:3002';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  return NextResponse.redirect(`${baseUrl}/student?enrolled=${courseId}&success=1`, 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '1';
  const email = url.searchParams.get('email') || '';
  const tranId = url.searchParams.get('tranId') || `TXN_${Date.now()}`;
  const amount = url.searchParams.get('amount') || '';
  const studentName = url.searchParams.get('name') || '';

  await processPaymentSuccess(courseId, email, tranId, amount, studentName);

  const host = request.headers.get('host') || 'localhost:3002';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  return NextResponse.redirect(`${baseUrl}/student?enrolled=${courseId}&success=1`, 303);
}
