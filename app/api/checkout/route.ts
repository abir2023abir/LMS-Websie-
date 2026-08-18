import { NextResponse } from 'next/server';
import { doc, updateDoc, addDoc, collection, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * POST /api/checkout
 * Processes course enrollment & payment transactions.
 * Structurally ready for SSLCommerz / aamarPay gateway integration.
 * Body requirements: userId, courseId, amount, paymentMethod
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId, courseTitle, amount, paymentMethod } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required for checkout.' },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Structure gateway payload (ready for SSLCommerz / aamarPay post requests)
    const gatewayPayload = {
      store_id: process.env.SSLCOMMERZ_STORE_ID || 'demo_store',
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || 'demo_pass',
      total_amount: amount || 49,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/checkout/callback?status=success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/checkout/callback?status=fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/checkout/callback?status=cancel`,
    };

    // SIMULATED MOCK TRANSACTION SUCCESS
    // In production, SSLCommerz/aamarPay returns a redirect URL to gateway host
    const isMockPayment = true;

    if (isMockPayment) {
      // 1. Update user document in Firestore if userId is provided
      if (userId && userId !== 'anonymous') {
        try {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            enrolledCourses: arrayUnion(courseId),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn('Could not update user enrolledCourses array in Firestore:', err);
        }
      }

      // 2. Record transaction in Firestore 'enrollments' collection
      try {
        await addDoc(collection(db, 'enrollments'), {
          userId: userId || 'anonymous',
          courseId,
          courseTitle: courseTitle || 'Enrolled Course',
          amount: amount || 0,
          paymentMethod: paymentMethod || 'SSLCommerz (Mock)',
          transactionId,
          status: 'PAID',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not write enrollment transaction record:', err);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Payment completed successfully via mock gateway',
          transactionId,
          gatewayPayload,
          redirectUrl: '/dashboard/student',
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('API POST /api/checkout Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Checkout payment processing failed',
      },
      { status: 500 }
    );
  }
}
