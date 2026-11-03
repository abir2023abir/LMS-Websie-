import { NextResponse } from 'next/server';
import { deleteCourse, getCourseById } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

// One course by ID, for client pages (the course list is already public at /api/courses).
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
  return NextResponse.json({ success: true, course });
}

// Admin only: remove a course.
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin('Courses');
  if (denied) return denied;
  await deleteCourse(params.id);
  return NextResponse.json({ success: true });
}
