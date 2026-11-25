import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite, isAdminSession } from '@/lib/admin-guard';
import { deleteReview, listReviews, saveReview } from '@/lib/reviews';
import { messageStudent } from '@/lib/desk-messages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin('Landing Page CMS');
  if (denied) return denied;
  return NextResponse.json({ success: true, reviews: await listReviews() });
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Landing Page CMS');
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') await deleteReview(String(body.id || ''));
    else if (body.action === 'like' || body.action === 'message') {
      const review = (await listReviews()).find((item) => item.id === body.id);
      if (!review) return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
      if (body.action === 'like') await saveReview({ ...review, liked: !review.liked });
      else {
        if (!review.studentEmail) return NextResponse.json({ success: false, message: 'This review has no student account to message.' }, { status: 400 });
        await messageStudent({
          name: review.name,
          email: review.studentEmail,
          text: String(body.text || ''),
          from: isAdminSession() ? 'admin' : 'instructor',
          courseId: review.courseId,
          courseTitle: review.courseTitle,
          topic: 'About your review',
        });
      }
    } else await saveReview(body);
    return NextResponse.json({ success: true, reviews: await listReviews() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the review.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
