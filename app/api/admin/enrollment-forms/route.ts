import { NextResponse } from 'next/server';
import { adminOnly } from '@/lib/mentor-scope';
import { listEnrollmentForms } from '@/lib/enrollment-forms';

export const dynamic = 'force-dynamic';

// Personal and guardian details: admin only.
export async function GET() {
  const blocked = adminOnly();
  if (blocked) return blocked;
  return NextResponse.json({ success: true, forms: await listEnrollmentForms() });
}
