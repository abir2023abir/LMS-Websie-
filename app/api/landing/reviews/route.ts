import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasCmsDatabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!hasCmsDatabase) return NextResponse.json({ success: true, reviews: [] });

  try {
    const { getAllReviews } = await import('@/lib/landing-cms');
    const rows = await getAllReviews();
    const reviews = rows
      .filter((review) => review.is_active && review.is_verified && review.permission_granted)
      .map((review) => ({
        id: review.id,
        title: review.review_title || 'A Better Learning Experience',
        name: review.reviewer_name,
        role: review.reviewer_role || '',
        text: review.review_text,
        rating: Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 ? review.rating : null,
      }));

    return NextResponse.json({ success: true, reviews });
  } catch {
    return NextResponse.json({ success: false, reviews: [] }, { status: 503 });
  }
}
