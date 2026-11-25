import { courseOverviews } from '@/lib/data';
import type { CourseSchema } from '@/types/course';

export type OverviewList = 'outcomes' | 'prerequisites' | 'audience';

/** A course page list: what the admin typed (one point per line), else the built-in text for the course. */
export function coursePoints(course: CourseSchema, key: OverviewList): string[] {
  const text = course[key];
  if (typeof text === 'string') return text.split('\n').map((line) => line.replace(/^\s*[•*-]\s*/, '').trim()).filter(Boolean);
  return courseOverviews[String(course.id)]?.[key] || [];
}

/** The "Certification" text; courses without their own use the client's standard one. */
export const certificationText = (title: string, own?: string) => own?.trim()
  || `${title} কোর্সটি ধাপে ধাপে structured learning, video lesson এবং stage-based assessment-এর মাধ্যমে সম্পন্ন হবে। Course completion এবং required marks অর্জন করলে certificate eligibility তৈরি হবে।`;
