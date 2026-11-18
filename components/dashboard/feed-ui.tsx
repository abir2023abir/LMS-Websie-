'use client';

import { AlertTriangle, BellRing, CheckCircle2, FileText, GraduationCap, Megaphone, Video, type LucideIcon } from 'lucide-react';

/** Shared by the admin Overview and the student Overview: the schedule and notification lists. */
export type ScheduleItem = { id: string; at: string; kind: 'live' | 'assignment' | 'exam'; title: string; detail: string; badge: 'LIVE' | 'Soon' | 'Upcoming' };
export type Notice = { id: string; at: string; kind: 'deadline' | 'live' | 'lesson' | 'risk' | 'review' | 'request' | 'done'; title: string; detail: string; tag: string };

const ZONE = 'Asia/Dhaka';
export const dayKey = (value: Date) => value.toLocaleDateString('en-CA', { timeZone: ZONE });
export const dayLabel = (iso: string) => {
  const at = new Date(iso);
  if (dayKey(at) === dayKey(new Date())) return 'TODAY';
  return at.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: ZONE }).toUpperCase();
};
export const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONE });
export const whenLabel = (iso: string) => {
  const at = new Date(iso);
  const minutes = Math.round((Date.now() - at.getTime()) / 60000);
  if (minutes >= 0 && minutes < 2) return 'Now';
  if (minutes >= 0 && minutes < 60) return `${minutes} min ago`;
  if (dayKey(at) === dayKey(new Date())) return 'Today';
  return at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: ZONE });
};

const scheduleIcon: Record<ScheduleItem['kind'], LucideIcon> = { live: Video, assignment: FileText, exam: GraduationCap };
const noticeIcon: Record<Notice['kind'], LucideIcon> = { deadline: BellRing, live: Video, lesson: Megaphone, risk: AlertTriangle, review: FileText, request: BellRing, done: CheckCircle2 };
export const badgeClass: Record<string, string> = {
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

export function Panel({ icon: Icon, title, hint, children, action }: { icon: LucideIcon; title: string; hint: string; children: React.ReactNode; action?: React.ReactNode }) {
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

export const Badge = ({ label }: { label: string }) => <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${badgeClass[label] || 'bg-slate-100 text-slate-600'}`}>[{label}]</span>;
export const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">{text}</p>;

/** "TODAY 10:00 · Live Class — Data Science · Module 1 · Instructor live session · [LIVE]" */
export function ScheduleList({ items, empty }: { items: ScheduleItem[]; empty: string }) {
  if (items.length === 0) return <Empty text={empty} />;
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = scheduleIcon[item.kind];
        return (
          <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-3.5">
            <div className="w-14 shrink-0 text-center">
              <p className="text-[11px] font-extrabold tracking-wide text-slate-500">{dayLabel(item.at)}</p>
              <p className="font-display text-sm font-extrabold text-slate-900">{timeLabel(item.at)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-start gap-1.5 text-sm font-bold text-slate-900"><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.badge === 'LIVE' ? 'text-rose-600' : 'text-[#A16207]'}`} /><span>{item.title}</span></p>
              <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
            </div>
            <Badge label={item.badge} />
          </li>
        );
      })}
    </ul>
  );
}

/** "Assignment deadline extended · Data Workflow · Student activity update · Now" */
export function NoticeList({ items, empty }: { items: Notice[]; empty: string }) {
  if (items.length === 0) return <Empty text={empty} />;
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((notice) => {
        const Icon = noticeIcon[notice.kind];
        return (
          <li key={notice.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${notice.kind === 'risk' ? 'text-rose-600' : notice.kind === 'done' ? 'text-emerald-600' : 'text-[#A16207]'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{notice.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{notice.detail}</p>
            </div>
            <span className="shrink-0 text-right text-[11px] font-bold text-slate-500">{notice.tag}<span className="block font-medium text-slate-400">{whenLabel(notice.at)}</span></span>
          </li>
        );
      })}
    </ul>
  );
}
