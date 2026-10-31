import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { getAllCourses } from '@/lib/db';
import { getFallbackCourseData } from '@/lib/progress';
import { listCourseEdits } from '@/lib/course-edits';

export const dynamic = 'force-dynamic';

// Course → module → lesson tree for pickers in the admin / mentor panels.
export async function GET() {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  const [courses, edits] = await Promise.all([getAllCourses().catch(() => []), listCourseEdits().catch(() => ({} as Record<string, { title?: string }>))]);
  const outline = courses.map((course) => {
    const id = String(course.id || '');
    const modules = course.modules?.length ? course.modules : getFallbackCourseData(id)?.modules || [];
    return {
      id,
      title: edits[id]?.title || course.title,
      modules: modules.map((mod) => ({ id: mod.id, title: mod.title, lessons: (mod.lessons || []).map((lesson) => ({ id: lesson.id, title: lesson.title })) })),
    };
  }).filter((course) => course.id);
  return NextResponse.json({ success: true, courses: outline });
}
