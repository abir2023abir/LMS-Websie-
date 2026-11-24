'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, BellRing, CalendarDays, FileText, GraduationCap, Megaphone, RefreshCw, Shield, ShieldCheck, Video, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

type ScheduleItem = { id: string; at: string; kind: 'live' | 'assignment' | 'exam'; title: string; detail: string; badge: 'LIVE' | 'Soon' | 'Upcoming' };
type Notice = { id: string; at: string; kind: 'deadline' | 'live' | 'lesson' | 'risk' | 'review' | 'request'; title: string; detail: string; tag: string };
type DeviceAlert = { id: string; at: string; studentId: string; name: string; email: string; agent: string; ip: string; stillBlocked: boolean };
type Enrollment = { id: string; at: string; name: string; studentId: string; courseTitle: string; status: 'Approved' | 'Pending' | 'Rejected' | 'Failed'; method: string };
type Feed = {
  schedule: ScheduleItem[];
  notifications: Notice[];
  security: { enabled: boolean; protectedCount: number; alerts: DeviceAlert[] };
  enrollments: Enrollment[];
  pendingEnrollments: number;
};

const ZONE = 'Asia/Dhaka';
const dayKey = (value: Date) => value.toLocaleDateString('en-CA', { timeZone: ZONE });
const dayLabel = (iso: string) => {
  const at = new Date(iso);
  if (dayKey(at) === dayKey(new Date())) return 'TODAY';
  return at.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: ZONE }).toUpperCase();
};
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONE });
const whenLabel = (iso: string) => {
  const at = new Date(iso);
  const minutes = Math.round((Date.now() - at.getTime()) / 60000);
  if (minutes >= 0 && minutes < 2) return 'Now';
  if (minutes >= 0 && minutes < 60) return `${minutes} min ago`;
  if (dayKey(at) === dayKey(new Date())) return 'Today';
  return at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: ZONE });
};
/** "ST-472281": a short, stable number made from the account id. */
const shortId = (id: string) => `ST-${(parseInt(id.replace(/[^0-9a-f]/gi, '').slice(0, 8) || '0', 16) % 1000000).toString().padStart(6, '0')}`;

const scheduleIcon: Record<ScheduleItem['kind'], LucideIcon> = { live: Video, assignment: FileText, exam: GraduationCap };
const noticeIcon: Record<Notice['kind'], LucideIcon> = { deadline: BellRing, live: Video, lesson: Megaphone, risk: AlertTriangle, review: FileText, request: BellRing };
const badgeClass: Record<string, string> = {
  LIVE: 'bg-rose-600 text-white',
  Soon: 'bg-[#FACC15] text-[#111827]',
  Upcoming: 'bg-slate-100 text-slate-600',
  Approved: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-[#FEF9C3] text-[#A16207]',
  Rejected: 'bg-rose-50 text-rose-700',
  Failed: 'bg-rose-50 text-rose-700',
  Blocked: 'bg-rose-50 text-rose-700',
  Protected: 'bg-emerald-50 text-emerald-700',
  Off: 'bg-slate-100 text-slate-600',
};

function Panel({ icon: Icon, title, hint, children, action }: { icon: LucideIcon; title: string; hint: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-[#FACC15]"><Icon className="h-4 w-4" /></span>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{hint}</span>
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

const Badge = ({ label }: { label: string }) => <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${badgeClass[label] || 'bg-slate-100 text-slate-600'}`}>[{label}]</span>;

function Ledger({ mark, title, hint, action, children }: { mark: 'shield' | 'bell'; title: string; hint: string; action?: React.ReactNode; children: React.ReactNode }) {
  const Icon = mark === 'shield' ? Shield : Bell;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon className={`h-4 w-4 ${mark === 'shield' ? 'text-amber-500' : 'text-amber-500'}`} />
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">{hint}</span>
          {action}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

function LedgerRow({ icon, title, detail, status, extra }: { icon: React.ReactNode; title: string; detail: string; status: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
        {extra && <div className="mt-1">{extra}</div>}
      </div>
      <Badge label={status} />
    </div>
  );
}
const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">{text}</p>;

/** Admin → Overview, below everything else: schedule, notifications, device alerts and new enrollments. */
export default function OverviewFeed({ onOpenTab }: { onOpenTab?: (tab: string) => void }) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState('');
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch('/api/admin/overview-feed', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((data) => { setFeed(data); setFailed(false); })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setStarted(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load, started]);

  const act = async (body: Record<string, unknown>, key: string, done: string) => {
    setBusy(key);
    try {
      const res = await fetch('/api/admin/overview-feed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not save.');
      toast.success(done);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy('');
    }
  };

  // The four panels are part of the client's Overview layout, so a failed load says so instead of vanishing.
  if (failed && !feed) return <div ref={containerRef} className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 shadow-sm">Could not load the schedule, notifications, device alerts and new enrollments. Press Refresh to try again.</div>;
  if (!feed) return <div ref={containerRef} className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">{started ? 'Loading schedule and alerts…' : 'Schedule and alerts will load as you reach them.'}</div>;

  const { security } = feed;

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── Upcoming schedule ── */}
        <div className="lg:col-span-7">
          <Panel icon={CalendarDays} title="Upcoming Schedule" hint="Next learning events" action={<button type="button" onClick={load} aria-label="Refresh" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><RefreshCw className="h-4 w-4" /></button>}>
            {feed.schedule.length === 0 ? <Empty text="Nothing is scheduled yet. Live classes, assignment deadlines and exam dates appear here." /> : (
              <ul className="space-y-3">
                {feed.schedule.map((item) => {
                  const Icon = scheduleIcon[item.kind];
                  return (
                    <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-3.5">
                      <div className="w-14 shrink-0 text-center">
                        <p className="text-[11px] font-extrabold tracking-wide text-slate-500">{dayLabel(item.at)}</p>
                        <p className="font-display text-sm font-extrabold text-slate-900">{timeLabel(item.at)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><Icon className={`h-4 w-4 shrink-0 ${item.badge === 'LIVE' ? 'text-rose-600' : 'text-[#A16207]'}`} /><span className="truncate">{item.title}</span></p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <Badge label={item.badge} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* ── Notifications ── */}
        <div className="lg:col-span-5">
          <Panel icon={Megaphone} title="Notifications" hint="Latest alerts">
            {feed.notifications.length === 0 ? <Empty text="No alerts right now." /> : (
              <ul className="divide-y divide-slate-100">
                {feed.notifications.map((notice) => {
                  const Icon = noticeIcon[notice.kind];
                  return (
                    <li key={notice.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${notice.kind === 'risk' ? 'text-rose-600' : 'text-[#A16207]'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{notice.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{notice.detail}</p>
                      </div>
                      <span className="shrink-0 text-right text-[11px] font-bold text-slate-500">{notice.tag}<span className="block font-medium text-slate-400">{whenLabel(notice.at)}</span></span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* ── Security / device alerts, then new enrollments. These sit at the bottom of Overview. ── */}
      <Ledger
        mark="shield"
        title="Security / Device Alerts"
        hint="Account protection"
        action={(
          <button type="button" disabled={busy === 'rule'} onClick={() => act({ action: 'device-rule', enabled: !security.enabled }, 'rule', security.enabled ? 'Single-device rule turned off.' : 'Single-device rule turned on.')} className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            {security.enabled ? 'Turn rule off' : 'Turn rule on'}
          </button>
        )}
      >
        {security.alerts.length === 0 && (
          <LedgerRow
            icon={<ShieldCheck className="h-4 w-4 text-sky-600" />}
            title={security.enabled ? 'No blocked sign-ins' : 'Single-device rule is off'}
            detail={security.enabled ? 'No unauthorized device has tried to sign in.' : 'Students can sign in on any number of devices.'}
            status={security.enabled ? 'Protected' : 'Off'}
          />
        )}
        {security.alerts.map((alert) => (
          <LedgerRow
            key={alert.id}
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            title="Blocked duplicate-device login"
            detail={`${alert.name} · ID ${shortId(alert.studentId)} · A login attempt from an unauthorized device was blocked.`}
            status="Blocked"
            extra={alert.stillBlocked ? (
              <button type="button" disabled={busy === alert.id} onClick={() => act({ action: 'reset-device', studentId: alert.studentId }, alert.id, `${alert.name} can now sign in on a new device.`)} className="text-[11px] font-bold text-[#111827] underline disabled:opacity-50">
                Allow new device
              </button>
            ) : null}
          />
        ))}
        <LedgerRow
          icon={<ShieldCheck className={`h-4 w-4 ${security.enabled ? 'text-sky-600' : 'text-slate-400'}`} />}
          title={security.enabled ? `${security.protectedCount === 1 ? 'One' : security.protectedCount} authorized device${security.protectedCount === 1 ? '' : 's'} active` : 'Single-device rule is off'}
          detail={security.enabled ? 'The account is currently protected by the single-device rule.' : 'Turn the rule on to limit each account to one device.'}
          status={security.enabled ? 'Protected' : 'Off'}
        />
      </Ledger>

      <Ledger mark="bell" title="New Enrollments" hint="Latest student activity">
        {feed.enrollments.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No enrollment requests yet. When a student pays for a course, it appears here.</p>
        ) : feed.enrollments.map((item) => (
          <LedgerRow
            key={item.id}
            icon={<GraduationCap className="h-4 w-4 text-violet-600" />}
            title={item.status === 'Approved' ? `${item.name} enrolment approved` : item.status === 'Pending' ? `${item.name} requested access to ${item.courseTitle}` : `${item.name} — payment ${item.status.toLowerCase()}`}
            detail={item.status === 'Pending'
              ? `ID ${shortId(item.studentId)} · Awaiting admin approval`
              : `${item.courseTitle} · ${shortId(item.studentId)}`}
            status={item.status}
            extra={item.status === 'Pending' && onOpenTab ? (
              <button type="button" onClick={() => onOpenTab('Payments')} className="text-[11px] font-bold text-[#111827] underline">Review</button>
            ) : null}
          />
        ))}
      </Ledger>
    </div>
  );
}
