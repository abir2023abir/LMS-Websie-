import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { lessonVideoKey, presignUpload, r2Configured, R2_PREFIX } from '@/lib/r2';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024 * 1024; // R2 single-upload limit (5 GB)
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']);

// Admins and mentors get a one-time URL to upload a lesson video straight to R2
// from the browser (Vercel cannot accept files this large itself).
export async function POST(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  if (!r2Configured) {
    return NextResponse.json({ success: false, message: 'Video storage is not set up yet. Add the R2 settings first (docs/video-storage.md).' }, { status: 503 });
  }
  try {
    const body = (await request.json()) as { courseId?: string; lessonId?: string; fileName?: string; contentType?: string; size?: number };
    const courseId = String(body.courseId || '').trim();
    const lessonId = String(body.lessonId || '').trim();
    if (!courseId || !lessonId) return NextResponse.json({ success: false, message: 'Save the course and lesson before uploading.' }, { status: 400 });
    if (!VIDEO_TYPES.has(String(body.contentType))) return NextResponse.json({ success: false, message: 'Upload an MP4, WEBM, MOV or MKV video.' }, { status: 400 });
    if (!Number(body.size) || Number(body.size) > MAX_BYTES) return NextResponse.json({ success: false, message: 'The video must be smaller than 5 GB.' }, { status: 400 });

    const key = lessonVideoKey(courseId, lessonId, String(body.fileName || 'video.mp4'));
    return NextResponse.json({ success: true, uploadUrl: presignUpload(key), videoRef: `${R2_PREFIX}${key}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not prepare the upload.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
