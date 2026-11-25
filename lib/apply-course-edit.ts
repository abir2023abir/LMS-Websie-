import type { CourseEdit } from '@/lib/course-edits';

/** A course with the saved admin edits applied. Used in the browser and on the server. */
export function applyCourseEdit<T extends { title?: string; price?: number; thumbnail?: string }>(
  course: T,
  edit?: CourseEdit,
): T {
  if (!edit) return course;
  return {
    ...course,
    title: edit.title || course.title,
    price: typeof edit.price === 'number' ? edit.price : course.price,
    ...(typeof edit.originalPrice === 'number' ? { originalPrice: edit.originalPrice } : {}),
    ...(edit.category ? { category: edit.category } : {}),
    ...(edit.level ? { level: edit.level } : {}),
    ...(edit.description ? { description: edit.description } : {}),
    ...(edit.type ? { type: edit.type } : {}),
    // An emptied text box is kept empty, so these apply even when blank.
    ...Object.fromEntries((['outcomes', 'prerequisites', 'audience', 'certification'] as const)
      .filter((key) => typeof edit[key] === 'string')
      .map((key) => [key, edit[key]])),
    thumbnail: edit.thumbnail || course.thumbnail,
    ...(Array.isArray(edit.modules) ? { modules: edit.modules } : {}),
  };
}
