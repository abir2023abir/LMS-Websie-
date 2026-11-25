import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { saveReview } from '@/lib/reviews';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Classroom → Reviews: an enrolled student reviews their course. It is saved unverified and
// unpublished; an admin checks it in Landing Page CMS → Reviews before it can appear on the site.
export async function POST(request: Request) {
  if (rateLimited(request, 'course-review', 5, 60 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '');
    if (!(await getEnrollments(profile.id)).includes(courseId)) {
      return NextResponse.json({ success: false, message: 'Enroll in this course first.' }, { status: 403 });
    }
    const text = String(body.text || '').trim();
    if (text.length < 10) return NextResponse.json({ success: false, message: 'Write at least a sentence about the course.' }, { status: 400 });
    const rating = Number(body.rating);
    await saveReview({
      name: profile.name,
      role: `Student · ${String(body.courseTitle || 'Course').slice(0, 60)}`,
      title: '',
      text,
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
      verified: false,
      permission: Boolean(body.permission),
      published: false,
      pages: ['home', 'course'],
      courseId,
      courseTitle: String(body.courseTitle || 'Course').slice(0, 200),
      studentEmail: profile.email,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not send the review.' }, { status: 400 });
  }
}
