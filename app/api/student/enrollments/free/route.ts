import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { coursePrice } from '@/lib/course-pricing';
import { courseIsFull, getEnrollments, grantEnrollment } from '@/lib/payments';
import { enrollmentClosedReason } from '@/lib/course-timeline';

export const dynamic = 'force-dynamic';

// Free courses still use the same authenticated, capacity-limited enrollment roster.
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;

  try {
    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course to enroll in.' }, { status: 400 });

    const price = await coursePrice(courseId);
    if (!price) return NextResponse.json({ success: false, message: 'This course is not available for enrollment.' }, { status: 404 });
    if (price.amount > 0) return NextResponse.json({ success: false, message: 'This course requires payment.' }, { status: 400 });

    const enrolled = await getEnrollments(profile.id);
    if (enrolled.includes(courseId)) return NextResponse.json({ success: true, alreadyEnrolled: true });
    if (await courseIsFull(courseId)) return NextResponse.json({ success: false, message: 'This course is full. 100,000 students are already enrolled.' }, { status: 403 });
    const closed = await enrollmentClosedReason(courseId);
    if (closed) return NextResponse.json({ success: false, message: closed }, { status: 403 });

    await grantEnrollment(profile.id, courseId);
    return NextResponse.json({ success: true, alreadyEnrolled: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not enroll in this course.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
