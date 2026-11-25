import { NextResponse } from 'next/server';
import { publishedReviews, REVIEW_PAGES } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

// Verified reviews with the learner's permission, managed in Admin → Landing Page CMS → Reviews.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = REVIEW_PAGES.find((item) => item === params.get('page')) || 'home';
    const reviews = (await publishedReviews(page, params.get('courseId') || '')).map((review) => ({
      id: review.id,
      title: review.title || 'A Better Learning Experience',
      name: review.name,
      role: review.role,
      text: review.text,
      rating: review.rating,
    }));
    return NextResponse.json({ success: true, reviews });
  } catch {
    return NextResponse.json({ success: false, reviews: [] }, { status: 503 });
  }
}
