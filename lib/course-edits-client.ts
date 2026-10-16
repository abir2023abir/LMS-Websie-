'use client';

import { useEffect, useState } from 'react';
import type { CourseEdit } from '@/lib/course-edits';

let cache: Record<string, CourseEdit> | null = null;
let pending: Promise<Record<string, CourseEdit>> | null = null;

export function loadCourseEdits(force = false): Promise<Record<string, CourseEdit>> {
  if (cache && !force) return Promise.resolve(cache);
  if (pending && !force) return pending;
  pending = fetch('/api/courses/edits', { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => (cache = data?.edits || {}))
    .catch(() => (cache = cache || {}))
    .finally(() => {
      pending = null;
    });
  return pending;
}

export function useCourseEdits(version = 0) {
  const [edits, setEdits] = useState<Record<string, CourseEdit>>(cache || {});
  useEffect(() => {
    let live = true;
    loadCourseEdits(version > 0).then((next) => live && setEdits(next));
    return () => {
      live = false;
    };
  }, [version]);
  return edits;
}

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
    thumbnail: edit.thumbnail || course.thumbnail,
  };
}

/** Resize an uploaded picture in the browser so it stays small enough to store. */
export function shrinkImage(fileInput: File, maxSide = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileInput);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file is not a picture.'));
    };
    img.src = url;
  });
}
