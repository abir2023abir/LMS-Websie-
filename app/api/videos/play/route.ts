import { NextResponse } from 'next/server';
import { currentProfile, staffIdentity } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { courseIdFromKey, lessonIdFromKey, presignPlayback } from '@/lib/r2';
import { lessonOpen } from '@/lib/progression';

export const dynamic = 'force-dynamic';

// <video src="/api/videos/play?key=..."> — checks that the viewer may watch this
// course, then redirects to a short-lived signed R2 link.
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key') || '';
  const courseId = courseIdFromKey(key);
  if (!courseId) return NextResponse.json({ success: false, message: 'Video not found.' }, { status: 404 });

  const staff = await staffIdentity();
  if (!staff) {
    const profile = await currentProfile();
    if (!profile) return NextResponse.json({ success: false, message: 'Sign in to watch this lesson.' }, { status: 401 });
    if (!(await getEnrollments(profile.id)).includes(courseId)) {
      return NextResponse.json({ success: false, message: 'Enroll in this course to watch its lessons.' }, { status: 403 });
    }
    if (!(await lessonOpen(profile.id, courseId, lessonIdFromKey(key)))) {
      return NextResponse.json({ success: false, message: 'Finish the previous lesson first.' }, { status: 403 });
    }
  }

  try {
    const response = NextResponse.redirect(presignPlayback(key), 302);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video storage is not available.';
    return NextResponse.json({ success: false, message }, { status: 503 });
  }
}
