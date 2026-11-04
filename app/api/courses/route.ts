import { NextResponse } from 'next/server';
import { getAllCourses, createCourse } from '@/lib/db';
import { requireAdminWrite } from '@/lib/admin-guard';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import type { CourseSchema, ModuleSchema } from '@/types/course';

/**
 * GET /api/courses
 * Fetches all available courses.
 */
export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error: any) {
    console.error('API GET /api/courses Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch courses',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Creates a new course.
 * Body requirements: title, description, instructorId, price, thumbnail, modules
 */
export async function POST(request: Request) {
  // The Courses tool must be open for this account; assistant mentors can only look.
  const blocked = await requireAdminWrite('Courses');
  if (blocked) return blocked;
  // Only admins and instructors may add courses; an instructor always adds under their own account.
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const {
      title,
      description,
      instructorName,
      price,
      originalPrice,
      thumbnail,
      category,
      level,
      duration,
      modules,
    } = body;
    const instructorId = staff.admin ? body.instructorId : staff.profile?.id;

    // Strict payload validation
    if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must be between 3 and 200 characters.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters.' },
        { status: 400 }
      );
    }

    if (!instructorId || typeof instructorId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid Instructor ID is required.' },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000) {
      return NextResponse.json(
        { success: false, error: 'Price must be a valid positive number.' },
        { status: 400 }
      );
    }

    // Calculate total lessons count from modules if provided
    let computedLessonCount = 0;
    if (Array.isArray(modules)) {
      modules.forEach((mod: ModuleSchema) => {
        if (Array.isArray(mod.lessons)) {
          computedLessonCount += mod.lessons.length;
        }
      });
    }

    const coursePayload: Omit<CourseSchema, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      instructorId: instructorId.trim(),
      instructorName: instructorName && typeof instructorName === 'string' ? instructorName.trim().slice(0, 100) : 'Instructor',
      price: parsedPrice,
      ...(originalPrice && !isNaN(Number(originalPrice)) ? { originalPrice: Number(originalPrice) } : {}),
      thumbnail: thumbnail && typeof thumbnail === 'string' ? thumbnail.trim() : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=340&fit=crop',
      category: category && typeof category === 'string' ? category.slice(0, 50) : 'Accounting',
      level: level && ['Beginner', 'Intermediate', 'Advanced'].includes(level) ? level : 'Beginner',
      duration: duration && typeof duration === 'string' ? duration.slice(0, 30) : '',
      lessonCount: computedLessonCount,
      modules: Array.isArray(modules) ? modules : [],
    };

    const requestedId = typeof body.id === 'string' && /^[a-z0-9]{8,40}$/i.test(body.id) ? body.id : undefined;
    const courseId = await createCourse(coursePayload, requestedId);

    return NextResponse.json(
      {
        success: true,
        courseId,
        message: 'Course created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API POST /api/courses Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create course',
      },
      { status: 500 }
    );
  }
}
