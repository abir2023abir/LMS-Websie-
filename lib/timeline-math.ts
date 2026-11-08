/*
 * The course timeline formulas, exactly as written in the timeline document.
 * Pure functions: no database, no clock. Every caller passes the server time in.
 * All times are milliseconds.
 */

export const HOUR = 3600000;

export type TimelineDates = {
  firstEnrolled: number; // enrollment opens
  lastEnrolled: number; // enrollment closes
  lastCounting: number; // baseline for the minimum lesson time
  courseEnding: number; // final deadline
};

/** Minimum Lesson Time = (Course Ending Date - Last Counting Date) / Total Lessons. */
export function minimumLessonTime(dates: Pick<TimelineDates, 'lastCounting' | 'courseEnding'>, totalLessons: number) {
  if (totalLessons <= 0) return 0;
  return Math.max(0, dates.courseEnding - dates.lastCounting) / totalLessons;
}

/** Initial Allocation = MAX((Course Ending - Enrollment) / Total Lessons, Minimum Lesson Time). */
export function initialAllocation(dates: TimelineDates, enrolledAt: number, totalLessons: number) {
  if (totalLessons <= 0) return 0;
  const perLesson = Math.max(0, dates.courseEnding - enrolledAt) / totalLessons;
  return Math.max(perLesson, minimumLessonTime(dates, totalLessons));
}

/** New Lesson Allocation = MAX(Remaining Time / Remaining Lessons, Minimum Lesson Time). */
export function dynamicAllocation(dates: TimelineDates, now: number, totalLessons: number, completedLessons: number) {
  const remainingLessons = totalLessons - completedLessons;
  if (remainingLessons <= 0) return 0;
  const perLesson = Math.max(0, dates.courseEnding - now) / remainingLessons;
  return Math.max(perLesson, minimumLessonTime(dates, totalLessons));
}

export type TimelineStatus = 'on-track' | 'at-risk' | 'expired' | 'completed';

export type TimelineState = {
  status: TimelineStatus;
  allocation: number; // time the current lesson gets
  minimum: number; // minimum lesson time
  remainingTime: number;
  remainingLessons: number;
  projectedCompletion: number; // when the student would finish at the current pace of allocations
  warning: string;
};

/**
 * Where a student stands. At Risk when the time left per lesson drops below the minimum lesson
 * time: the minimum is never lowered; the projected completion date moves past the ending date.
 */
export function timelineState(dates: TimelineDates, now: number, totalLessons: number, completedLessons: number, endingOverride = 0): TimelineState {
  const ending = Math.max(dates.courseEnding, endingOverride || 0);
  const effective = { ...dates, courseEnding: ending };
  const minimum = minimumLessonTime(dates, totalLessons);
  const remainingLessons = Math.max(0, totalLessons - completedLessons);
  const remainingTime = Math.max(0, ending - now);
  if (totalLessons > 0 && remainingLessons === 0) {
    return { status: 'completed', allocation: 0, minimum, remainingTime, remainingLessons, projectedCompletion: now, warning: '' };
  }
  if (now > ending) {
    return { status: 'expired', allocation: 0, minimum, remainingTime: 0, remainingLessons, projectedCompletion: now + remainingLessons * minimum, warning: 'The course ending date has passed. Ask the admin for an extension.' };
  }
  const allocation = dynamicAllocation(effective, now, totalLessons, completedLessons);
  const perLesson = remainingLessons ? remainingTime / remainingLessons : 0;
  const atRisk = remainingLessons > 0 && perLesson < minimum;
  return {
    status: atRisk ? 'at-risk' : 'on-track',
    allocation,
    minimum,
    remainingTime,
    remainingLessons,
    projectedCompletion: atRisk ? now + remainingLessons * minimum : ending,
    warning: atRisk ? 'You are behind schedule. The minimum time per lesson cannot be reduced, so you may not finish by the course ending date.' : '',
  };
}

/** Dates must follow each other: first ≤ last enrolled ≤ last counting ≤ ending. */
export function validateTimelineDates(dates: TimelineDates): string {
  const values = Object.values(dates);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) return 'Fill in all four dates.';
  if (dates.lastEnrolled < dates.firstEnrolled) return 'The last enrolled date must be after the first enrolled date.';
  if (dates.lastCounting < dates.firstEnrolled) return 'The last counting date must be after the first enrolled date.';
  if (dates.courseEnding <= dates.lastCounting) return 'The course ending date must be after the last counting date.';
  if (dates.courseEnding <= dates.lastEnrolled) return 'The course ending date must be after the last enrolled date.';
  return '';
}

/** Enrollment window: open between the first and last enrolled dates. */
export function enrollmentWindow(dates: TimelineDates, now: number): 'not-open' | 'open' | 'closed' {
  if (now < dates.firstEnrolled) return 'not-open';
  if (now > dates.lastEnrolled) return 'closed';
  return 'open';
}
