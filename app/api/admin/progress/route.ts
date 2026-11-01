import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { courseRanking } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

// Ranking and progress analytics for one course.
export async function GET(request: Request) {
  if (!(await staffIdentity())) return staffDenied();
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course.' }, { status: 400 });
  return NextResponse.json({ success: true, ranking: await courseRanking(courseId) });
}
