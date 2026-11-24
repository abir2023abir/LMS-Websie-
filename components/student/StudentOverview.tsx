'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, GraduationCap, Megaphone, RefreshCw } from 'lucide-react';
import { NoticeList, Panel, ScheduleList, type Notice, type ScheduleItem } from '@/components/dashboard/feed-ui';
import SiteMenuBar from '@/components/dashboard/SiteMenuBar';

/** "Good morning / afternoon / evening" by the time in Bangladesh. */
function greeting() {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Dhaka' }));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** Student → Overview (client layout): website menu, greeting card, Upcoming Schedule, Notifications. */
export default function StudentOverview({ name, subtitle }: { name: string; subtitle: string }) {
  const [feed, setFeed] = useState<{ schedule: ScheduleItem[]; notifications: Notice[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const [hello, setHello] = useState('Hello');

  const load = useCallback(() => {
    fetch('/api/student/overview-feed', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => { setFeed({ schedule: data.schedule || [], notifications: data.notifications || [] }); setFailed(false); })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    setHello(greeting());
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="space-y-8">
      <SiteMenuBar />

      <section className="flex flex-col gap-5 rounded-3xl border border-[#EAB308] bg-gradient-to-br from-[#FACC15] to-[#EAB308] p-5 text-[#111827] shadow-[0_18px_40px_-22px_rgba(234,179,8,0.95)] sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#FACC15] shadow-xl shadow-black/20 sm:h-20 sm:w-20" aria-hidden="true">
          <GraduationCap className="h-9 w-9 sm:h-10 sm:w-10" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{hello}, {name} <span aria-hidden="true">👋</span></h2>
          <p className="mt-1 text-sm font-semibold text-[#111827]/75">{subtitle}</p>
        </div>
      </section>

      {/* Client layout: the schedule, then the notifications under it. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel
            icon={CalendarDays}
            title="Upcoming Schedule"
            hint="Next learning events"
            action={<button type="button" onClick={load} aria-label="Refresh" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><RefreshCw className="h-4 w-4" /></button>}
          >
            {!feed ? <p className="text-sm text-slate-500">{failed ? 'Could not load your schedule. Press refresh to try again.' : 'Loading…'}</p>
              : <ScheduleList items={feed.schedule} empty="Nothing is scheduled yet. Live classes, assignment deadlines and exam dates of your courses appear here." />}
          </Panel>
        </div>
        <div className="lg:col-span-8">
          <Panel icon={Megaphone} title="Notifications" hint="Latest alerts">
            {!feed ? <p className="text-sm text-slate-500">{failed ? 'Could not load notifications.' : 'Loading…'}</p>
              : <NoticeList items={feed.notifications} empty="No alerts right now. Replies from your mentor, marked assignments and new lessons appear here." />}
          </Panel>
        </div>
      </div>
    </div>
  );
}
