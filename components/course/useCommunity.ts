'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CourseQuestion, DiscussionPost, ShortVideo } from '@/lib/course-community';

export type CommunityData = {
  questions: CourseQuestion[];
  shorts: ShortVideo[];
  discussions: DiscussionPost[];
  /** Enrolled in the course, or part of its team. */
  member: boolean;
  /** May add, edit and remove the course team's content. */
  canManage: boolean;
};

/** A course's short videos, relevant questions and discussion, with the actions that change them. */
export function useCommunity(courseId: string) {
  const [data, setData] = useState<CommunityData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    fetch(`/api/courses/community?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.message || 'Could not load.');
        setData(body);
        setError('');
      })
      .catch(() => setError('Could not load this part. Refresh the page to try again.'));
  }, [courseId]);
  useEffect(() => { setData(null); load(); }, [load]);

  /** Sends one change and shows the updated lists. Throws with a readable message when it fails. */
  const post = useCallback(async (action: string, body: Record<string, unknown> = {}) => {
    const res = await fetch('/api/courses/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, action, courseId }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) throw new Error(result.message || result.error || 'Could not save.');
    setData(result);
  }, [courseId]);

  return { data, error, post };
}
