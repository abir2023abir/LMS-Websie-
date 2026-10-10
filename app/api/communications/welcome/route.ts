import { NextResponse } from 'next/server';
import { sendWelcomeEmail, type WelcomeEmailPayload } from '@/lib/email';
import { getCourseById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, studentName, courseId, courseTitle, transactionId, amountPaid } = body;

    if (!toEmail || !courseId) {
      return NextResponse.json(
        { success: false, message: 'Missing required email or courseId' },
        { status: 400 }
      );
    }

    // Resolve course title if not provided
    let resolvedTitle = courseTitle;
    if (!resolvedTitle) {
      const course = await getCourseById(courseId);
      resolvedTitle = course?.title || 'English Capsule Program';
    }

    const payload: WelcomeEmailPayload = {
      toEmail,
      studentName: studentName || 'Learner',
      courseId,
      courseTitle: resolvedTitle,
      transactionId: transactionId || `TXN_${Date.now()}`,
      amountPaid,
    };

    const result = await sendWelcomeEmail(payload);

    return NextResponse.json({
      success: true,
      message: 'Personalized Welcome & Getting Started email dispatched successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('[API communications/welcome] Error dispatching email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
