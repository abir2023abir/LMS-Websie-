import type { CourseSchema } from '@/types/course';
import { featuredCourses } from '@/lib/data';
import { kvGet, kvSet } from '@/lib/kv-store';

// Courses live in kv-store (Supabase app_kv on Vercel, a local file in development).
// Until a course is created or deleted, the built-in catalogue in lib/data is used.
const COURSES_KEY = 'courses';

const mapFallbackCourse = (c: (typeof featuredCourses)[number]): CourseSchema => ({
  id: c.id,
  title: c.title,
  description: c.description,
  instructorId: c.instructor.name,
  instructorName: c.instructor.name,
  price: c.price,
  originalPrice: c.originalPrice,
  thumbnail: c.thumbnail,
  category: c.category,
  level: c.level,
  rating: c.rating,
  reviewCount: c.reviewCount,
  studentCount: c.studentCount,
  duration: c.duration,
  lessonCount: c.lessonCount,
});

const fallbackCourses = (): CourseSchema[] => featuredCourses.map(mapFallbackCourse);

async function readCourses(): Promise<CourseSchema[]> {
  return (await kvGet<CourseSchema[] | null>(COURSES_KEY, null)) ?? fallbackCourses();
}

/**
 * Creates a new course.
 */
// `id` lets the course builder upload lesson videos before the course is saved.
export async function createCourse(courseData: Omit<CourseSchema, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<string> {
  const courseId = id || `course-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const course = {
    ...courseData,
    id: courseId,
    rating: courseData.rating ?? 0,
    reviewCount: courseData.reviewCount ?? 0,
    studentCount: courseData.studentCount ?? 0,
    createdAt: now,
    updatedAt: now,
  } as CourseSchema;
  const list = (await readCourses()).filter((c) => c.id !== courseId);
  await kvSet(COURSES_KEY, [course, ...list]);
  return courseId;
}

/**
 * Fetches all courses, newest first.
 */
export async function getAllCourses(): Promise<CourseSchema[]> {
  return readCourses();
}

/**
 * Fetches a single course by its ID.
 */
export async function getCourseById(courseId: string): Promise<CourseSchema | null> {
  return (await readCourses()).find((c) => c.id === courseId) || null;
}

/**
 * Fetches all courses created by a specific instructor.
 */
export async function getCoursesByInstructor(instructorId: string): Promise<CourseSchema[]> {
  return (await readCourses()).filter((c) => c.instructorId === instructorId);
}

/**
 * Deletes a course by ID.
 */
export async function deleteCourse(courseId: string): Promise<boolean> {
  const list = await readCourses();
  if (!list.some((c) => c.id === courseId)) return true;
  await kvSet(COURSES_KEY, list.filter((c) => c.id !== courseId));
  return true;
}
