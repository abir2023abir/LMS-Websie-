import { notFound } from 'next/navigation';
import { getCourseById } from '@/lib/db';
import CheckoutPageClient from '@/components/checkout/CheckoutPageClient';
import { getFallbackCourseData } from '@/lib/progress';
import { featuredCourses } from '@/lib/data';
import type { CourseSchema } from '@/types/course';

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { courseId } = params;

  let course: CourseSchema | null = null;

  try {
    course = await getCourseById(courseId);
  } catch {
    // fallback if firestore demo mode
  }

  if (!course) {
    // Only the built-in catalogue courses have offline fallbacks; anything else is a 404.
    course = featuredCourses.some((c) => c.id === courseId) ? getFallbackCourseData(courseId) : null;
  }

  if (!course) {
    notFound();
  }

  return <CheckoutPageClient course={course} />;
}
