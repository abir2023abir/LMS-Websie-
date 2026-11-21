import { NextResponse } from 'next/server';
import { deleteCourse, getCourseById } from '@/lib/db';
import { isAdminSession, requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { currentProfile } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

// One course by ID, for client pages (the course list is already public at /api/courses).
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
  return NextResponse.json({ success: true, course });
}

// Admin only: remove a course.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminWrite('Courses');
  if (denied) return denied;
  // An instructor may delete only a course they created; the admin may delete any.
  if (!isAdminSession()) {
    const [profile, course] = await Promise.all([currentProfile(), getCourseById(params.id)]);
    if (!profile || !course || course.instructorId !== profile.id) {
      return NextResponse.json({ success: false, message: 'Only the admin or the instructor who made this course can delete it.' }, { status: 403 });
    }
  }
  await deleteCourse(params.id);
  return NextResponse.json({ success: true });
}
