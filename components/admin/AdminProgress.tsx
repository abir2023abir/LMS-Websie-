'use client';

import ProgressRequests from './ProgressRequests';
import CourseAnalytics from './CourseAnalytics';

/** Admin → Progress: next-lesson requests, then full course analytics and ranking. */
export default function AdminProgress() {
  return (
    <div className="space-y-5">
      <ProgressRequests />
      <CourseAnalytics />
    </div>
  );
}
