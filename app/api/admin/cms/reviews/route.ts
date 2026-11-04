import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { deleteReview, listReviews, saveReview } from '@/lib/reviews';

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
    else await saveReview(body);
    return NextResponse.json({ success: true, reviews: await listReviews() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the review.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
