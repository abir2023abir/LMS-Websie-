import { NextResponse } from 'next/server';
import { courseAccessDenied } from '@/lib/mentor-scope';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { listCourseEdits, saveCourseEdit, type CourseEdit } from '@/lib/course-edits';
import { COURSE_TYPES } from '@/types/course';

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
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    if (!courseId) return NextResponse.json({ success: false, message: 'Pick a course.' }, { status: 400 });
    // Instructors change only the courses they made or were assigned.
    const outside = await courseAccessDenied(courseId);
    if (outside) return outside;

    const patch: CourseEdit = {};
    for (const key of ['title', 'category', 'level', 'description'] as const) {
      if (typeof body[key] === 'string') patch[key] = body[key].trim();
    }
    for (const key of ['outcomes', 'prerequisites', 'audience', 'certification'] as const) {
      if (typeof body[key] === 'string') patch[key] = body[key].trim().slice(0, 4000);
    }
    if (COURSE_TYPES.includes(body.type)) patch.type = body.type;
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
    if (Array.isArray(body.modules)) {
      patch.modules = body.modules.map((mod: any, modIndex: number) => ({
        id: String(mod?.id || `mod-${modIndex + 1}`),
        title: String(mod?.title || `Module ${modIndex + 1}`).slice(0, 160),
        lessons: Array.isArray(mod?.lessons)
          ? mod.lessons.map((lesson: any, lessonIndex: number) => ({
              id: String(lesson?.id || `les-${modIndex + 1}-${lessonIndex + 1}`),
              title: String(lesson?.title || `Lesson ${lessonIndex + 1}`).slice(0, 160),
              videoUrl: String(lesson?.videoUrl || '').trim(),
              duration: lesson?.duration ? String(lesson.duration).slice(0, 20) : undefined,
              overview: String(lesson?.overview || '').trim().slice(0, 6000),
              notes: String(lesson?.notes || '').trim().slice(0, 6000),
              actionSteps: String(lesson?.actionSteps || '').trim().slice(0, 3000),
              // Days this lesson gets in the day-wise timeline (0 = share the course length evenly).
              days: Math.max(0, Math.min(365, Math.round(Number(lesson?.days) || 0))) || undefined,
              // Video 2, 3, … of the lesson (at most 10); empty links are dropped.
              moreVideos: Array.isArray(lesson?.moreVideos)
                ? lesson.moreVideos
                    .map((video: any, videoIndex: number) => ({
                      id: String(video?.id || `v${videoIndex + 2}`).replace(/[^\w-]/g, '').slice(0, 40) || `v${videoIndex + 2}`,
                      title: String(video?.title || '').trim().slice(0, 160),
                      url: String(video?.url || '').trim().slice(0, 1000),
                    }))
                    .filter((video: { url: string }) => video.url)
                    .slice(0, 10)
                : undefined,
            }))
          : [],
      }));
    }

    return NextResponse.json({ success: true, edit: await saveCourseEdit(courseId, patch) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Could not save.' }, { status: 500 });
  }
}
