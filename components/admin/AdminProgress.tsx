'use client';

import ProgressRequests from './ProgressRequests';
import CourseAnalytics from './CourseAnalytics';
import RiskAlerts from './RiskAlerts';

/** Admin → Progress: more-time requests, risk alerts, then full course analytics and ranking. */
export default function AdminProgress() {
  return (
    <div className="space-y-5">
      <ProgressRequests />
      <RiskAlerts />
      <CourseAnalytics />
    </div>
  );
}
