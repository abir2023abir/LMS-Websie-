import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { listCourseEdits, saveCourseEdit, type CourseEdit } from '@/lib/course-edits';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_CHARS = 1_500_000;

export async function GET() {
  try {
    return NextResponse.json({ success: true, edits: await listCourseEdits() });
  } catch (error: any) {
    return NextResponse.json({ success: false, edits: {}, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    if (!courseId) return NextResponse.json({ success: false, message: 'Pick a course.' }, { status: 400 });

    const patch: CourseEdit = {};
    for (const key of ['title', 'category', 'level', 'description'] as const) {
      if (typeof body[key] === 'string') patch[key] = body[key].trim();
    }
    for (const key of ['price', 'originalPrice'] as const) {
      if (body[key] !== undefined && body[key] !== '') {
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value < 0) {
          return NextResponse.json({ success: false, message: 'Price must be a number.' }, { status: 400 });
        }
        patch[key] = value;
      }
    }
    if (typeof body.thumbnail === 'string') {
      const thumb = body.thumbnail.trim();
      if (thumb && !/^(https:\/\/|data:image\/(jpeg|png|webp);base64,)/.test(thumb)) {
        return NextResponse.json({ success: false, message: 'Image must be an upload or an https link.' }, { status: 400 });
      }
      if (thumb.length > MAX_IMAGE_CHARS) {
        return NextResponse.json({ success: false, message: 'Image is too large.' }, { status: 400 });
      }
      patch.thumbnail = thumb;
    }
    if (body.videos && typeof body.videos === 'object') {
      patch.videos = Object.fromEntries(
        Object.entries(body.videos as Record<string, unknown>).map(([id, url]) => [id, String(url || '').trim()]),
      );
    }

    return NextResponse.json({ success: true, edit: await saveCourseEdit(courseId, patch) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Could not save.' }, { status: 500 });
  }
}
