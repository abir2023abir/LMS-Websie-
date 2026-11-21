'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { Panel, ScheduleList, type ScheduleItem } from '@/components/dashboard/feed-ui';

const AdminLiveClasses = dynamic(() => import('./AdminLiveClasses'), { loading: () => <div className="h-40 animate-pulse rounded-3xl bg-white" /> });

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live classes' },
  { key: 'assignment', label: 'Assignments' },
  { key: 'exam', label: 'Exams' },
] as const;

/**
 * Admin → Schedule: every upcoming live class, assignment deadline and exam window across all
 * courses in one list, and the live-class planner below it to add or change classes.
 */
export default function AdminSchedule() {
  const { data, isLoading, mutate } = useSWR('/api/admin/overview-feed?schedule=all', fetcher, { refreshInterval: 60000 });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const items: ScheduleItem[] = Array.isArray(data?.schedule) ? data.schedule : [];
  const shown = filter === 'all' ? items : items.filter((item) => item.kind === filter);

  return (
    <div className="space-y-6">
      <Panel
        icon={CalendarDays}
        title="Upcoming Schedule"
        hint="Every course, next events first"
        action={(
          <button type="button" onClick={() => mutate()} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </button>
        )}
      >
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter schedule">
          {FILTERS.map((option) => {
            const count = option.key === 'all' ? items.length : items.filter((item) => item.kind === option.key).length;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={filter === option.key}
                onClick={() => setFilter(option.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${filter === option.key ? 'bg-[#111827] text-[#FACC15]' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {option.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
        {isLoading && !data ? (
          <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ) : (
          <ScheduleList items={shown} empty="Nothing is scheduled yet. Add a live class below, or set a deadline on an assignment or exam." />
        )}
      </Panel>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-extrabold text-slate-900">Live classes</h2>
        <p className="text-sm text-slate-500">Schedule a new live class or change one. Students of that course see it in their calendar.</p>
        <AdminLiveClasses />
      </div>
    </div>
  );
}
