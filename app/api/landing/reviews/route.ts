import { NextResponse } from 'next/server';
import { publishedReviews } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

// Verified reviews with the learner's permission, managed in Admin → Landing Page CMS → Reviews.
export async function GET(request: Request) {
  try {
    const page = new URL(request.url).searchParams.get('page') === 'bookkeeping' ? 'bookkeeping' : 'home';
    const reviews = (await publishedReviews(page)).map((review) => ({
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
