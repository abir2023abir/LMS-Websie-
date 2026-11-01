'use client';

import { useEffect, useState } from 'react';
import { fieldClass } from './AdminModal';

export type Outline = { id: string; title: string; modules: { id: string; title: string; lessons: { id: string; title: string }[] }[] }[];
export type Place = { courseId: string; courseTitle: string; moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string };

const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';

/** Loads the course → module → lesson tree once for admin pickers. */
export function useCourseOutline() {
  const [outline, setOutline] = useState<Outline>([]);
  useEffect(() => {
    fetch('/api/course-outline', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setOutline(data.courses || []))
      .catch(() => setOutline([]));
  }, []);
  return outline;
}

/**
 * Three linked dropdowns: course, then module, then lesson. `depth` limits how far the
 * admin must go ('lesson' for assignments, 'course' for an exam that can cover a whole course).
 */
export default function CoursePlacePicker({
  outline,
  value,
  onChange,
  depth = 'lesson',
}: {
  outline: Outline;
  value: Place;
  onChange: (next: Place) => void;
  depth?: 'lesson' | 'course';
}) {
  const course = outline.find((item) => item.id === value.courseId);
  const mod = course?.modules.find((item) => item.id === value.moduleId);
  const optional = depth === 'course';

  return (
    <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Where students see it</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label><span className={labelClass}>1. Course</span>
          <select className={fieldClass} value={value.courseId} onChange={(e) => {
            const picked = outline.find((item) => item.id === e.target.value);
            onChange({ courseId: e.target.value, courseTitle: picked?.title || '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '' });
          }}>
            <option value="">Choose course</option>
            {outline.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label><span className={labelClass}>2. Module{optional ? ' (optional)' : ''}</span>
          <select className={fieldClass} value={value.moduleId} disabled={!course} onChange={(e) => {
            const picked = course?.modules.find((item) => item.id === e.target.value);
            onChange({ ...value, moduleId: e.target.value, moduleTitle: picked?.title || '', lessonId: '', lessonTitle: '' });
          }}>
            <option value="">{optional ? 'Whole course' : 'Choose module'}</option>
            {course?.modules.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label><span className={labelClass}>3. Lesson{optional ? ' (optional)' : ''}</span>
          <select className={fieldClass} value={value.lessonId} disabled={!mod} onChange={(e) => {
            const picked = mod?.lessons.find((item) => item.id === e.target.value);
            onChange({ ...value, lessonId: e.target.value, lessonTitle: picked?.title || '' });
          }}>
            <option value="">{optional ? 'Whole module' : 'Choose lesson'}</option>
            {mod?.lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
