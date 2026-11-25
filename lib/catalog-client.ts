'use client';

import { useEffect, useMemo, useState } from 'react';
import { featuredCourses, type Course } from '@/lib/data';
import { applyCourseEdit, useCourseEdits } from '@/lib/course-edits-client';
import type { CourseType } from '@/types/course';

type StoredCourse = {
  id: string; title: string; description?: string; price?: number; originalPrice?: number; thumbnail?: string;
  category?: string; duration?: string; instructorName?: string; studentCount?: number; createdAt?: string;
  type?: CourseType; modules?: { lessons?: unknown[] }[];
};

export type CatalogCourse = Course & { type?: CourseType };

const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop';

/** A course made in the admin or instructor panel, shaped like the built-in catalog entries. */
function toCatalogCourse(course: StoredCourse): CatalogCourse {
  const lessons = (course.modules || []).reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
  return {
    id: String(course.id),
    slug: String(course.id),
    title: course.title || 'Course',
    description: course.description || '',
    instructor: { name: course.instructorName || 'Career Bridge Team', avatar: '', title: '' },
    thumbnail: course.thumbnail || FALLBACK_THUMB,
    category: course.category || 'Accounting',
    categoryColor: '',
    price: Number(course.price) || 0,
    originalPrice: Number(course.originalPrice) || 0,
    rating: 0,
    reviewCount: 0,
    studentCount: Number(course.studentCount) || 0,
    duration: course.duration || '',
    lessonCount: lessons,
    level: 'Beginner',
    tags: [],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    type: course.type,
  };
}

/**
 * The public course list shared by the home page and All Courses: built-in courses plus the ones made
 * in the admin / instructor panel, with saved edits applied and hidden or archived courses left out.
 */
export function useCatalog() {
  const courseEdits = useCourseEdits();
  // The saved course list; null until it has loaded (or if it could not be loaded).
  const [saved, setSaved] = useState<StoredCourse[] | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/courses', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSaved(Array.isArray(data?.courses) ? (data.courses as StoredCourse[]) : null))
      .catch(() => setSaved(null));
    fetch('/api/courses/settings')
      .then((res) => res.json())
      .then((data) => {
        const rows = Object.values(data.settings || {}) as { course_id: string; visibility: string; discount: number }[];
        setHiddenIds(rows.filter((row) => row.visibility !== 'published').map((row) => row.course_id));
        setDiscounts(Object.fromEntries(rows.map((row) => [row.course_id, row.discount || 0])));
      })
      .catch(() => undefined);
  }, []);

  /** Courses added in the panel, newest first. */
  const added = useMemo<CatalogCourse[]>(() => {
    const builtIn = new Set(featuredCourses.map((course) => String(course.id)));
    return (saved || []).filter((course) => course.id && !builtIn.has(String(course.id))).map(toCatalogCourse);
  }, [saved]);
  /** Every course, before edits and visibility. A built-in course that was deleted in the panel is left out. */
  const all = useMemo<CatalogCourse[]>(() => {
    const kept = saved ? new Set(saved.map((course) => String(course.id))) : null;
    const builtIn = featuredCourses.filter((course) => !kept || kept.has(String(course.id)));
    const types = new Map((saved || []).map((course) => [String(course.id), course.type]));
    return [...builtIn.map((course) => ({ ...course, type: types.get(String(course.id)) })), ...added];
  }, [saved, added]);
  /** What visitors may see. */
  const visible = useMemo(
    () => all.map((course) => applyCourseEdit(course, courseEdits[String(course.id)])).filter((course) => !hiddenIds.includes(String(course.id))),
    [all, courseEdits, hiddenIds],
  );
  /** The price after the course discount set by the admin. */
  const priceOf = (course: CatalogCourse) => Math.max(0, Math.round(course.price * (100 - (discounts[String(course.id)] || 0)) / 100));

  return { all, added, visible, courseEdits, priceOf };
}
