import { NextResponse } from 'next/server';
import { publicPaymentMethods } from '@/lib/payments';
import { coursePrice } from '@/lib/course-pricing';

export const dynamic = 'force-dynamic';

// Public: which payment methods are switched on, and the server-side price of a course.
export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  const [methods, price] = await Promise.all([publicPaymentMethods(), courseId ? coursePrice(courseId) : Promise.resolve(null)]);
  return NextResponse.json({ success: true, ...methods, price });
}
