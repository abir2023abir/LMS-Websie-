/** Days stack inside a module: 2 + 2 + 2 means finish by day 2, day 4, and day 6. */
export function lessonDueDay(lessons: { days?: number }[], index: number) {
  return lessons.slice(0, index + 1).reduce((sum, lesson) => sum + (Number(lesson.days) > 0 ? Number(lesson.days) : 0), 0);
}

export function lessonWindowLabel(lessons: { days?: number }[], index: number) {
  const own = Number(lessons[index]?.days) || 0;
  const due = lessonDueDay(lessons, index);
  if (!own || !due) return '';
  return `${own} day${own === 1 ? '' : 's'} · finish by day ${due}`;
}
