'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, BookOpen, CalendarClock, Check, Clock, ClipboardList, FileText, GraduationCap, HelpCircle, Lock, PlayCircle, Send, Video } from 'lucide-react';

export type StepKey = 'overview' | 'video' | 'quiz' | 'notes' | 'assignment' | 'exam';
export type Step = { key: StepKey; label: string; state: 'done' | 'current' | 'locked'; detail: string };
export type LessonProgress = { lessonId: string; lessonTitle: string; state: 'done' | 'current' | 'locked'; steps: Step[]; hint?: string; dueAt?: string; allocationHours?: number; rescheduled?: number; pendingExtension?: boolean };
export type CourseTimeline = { configured: boolean; status: 'none' | 'on-track' | 'at-risk' | 'expired' | 'completed'; minimumHours: number; allocationHours: number; remainingDays: number; projectedCompletion: string; endingAt: string; enrolledAt: string; warning: string };
export type LiveSession = { id: string; title: string; description: string; startsAt: string; durationMinutes: number; joinUrl: string; recordingUrl: string; joinable: boolean; attended: boolean };

const icons: Record<StepKey, typeof PlayCircle> = { overview: FileText, video: PlayCircle, quiz: HelpCircle, notes: BookOpen, assignment: ClipboardList, exam: GraduationCap };
const when = (iso: string) => new Date(iso).toLocaleString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const day = (iso: string) => new Date(iso).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
const left = (ms: number) => {
  if (ms <= 0) return 'now';
  const hours = Math.round(ms / 3600000);
  return hours >= 48 ? `${Math.round(hours / 24)} days` : `${Math.max(1, hours)} hour${hours === 1 ? '' : 's'}`;
};

/**
 * One lesson's six parts. Overview and video open together, the quiz opens after both, notes and
 * the assignment after the quiz, and the exam after everything else. Live classes sit beside the
 * path: a student can always join one.
 */
export default function LessonSteps({
  courseId, lesson, lives, timeline, rank, rankTotal, onOpenTab, onChanged,
}: {
  courseId: string;
  lesson: LessonProgress;
  lives: LiveSession[];
  timeline?: CourseTimeline;
  rank: number | null;
  rankTotal: number;
  onOpenTab: (tab: 'overview' | 'quiz' | 'assignment' | 'resources') => void;
  onChanged: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const [extMessage, setExtMessage] = useState('');
  const currents = lesson.steps.filter((step) => step.state === 'current');
  const done = lesson.steps.filter((step) => step.state === 'done').length;
  const due = lesson.dueAt ? new Date(lesson.dueAt) : null;
  const needsTime = timeline && (timeline.status === 'at-risk' || timeline.status === 'expired');

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, lessonId: lesson.lessonId, ...payload }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || 'Something went wrong.');
    return data;
  };

  const askForTime = async () => {
    setSending(true); setNote('');
    try { await post({ action: 'extension', message: extMessage }); setExtMessage(''); onChanged(); }
    catch (error) { setNote(error instanceof Error ? error.message : 'Could not send.'); }
    finally { setSending(false); }
  };

  const join = async (live: LiveSession) => {
    setNote('');
    try {
      const data = await post({ action: 'join', liveId: live.id });
      if (data.joinUrl) window.open(data.joinUrl, '_blank', 'noopener,noreferrer');
      onChanged();
    } catch (error) { setNote(error instanceof Error ? error.message : 'Could not join.'); }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Lesson path</p>
          <p className="font-display font-bold text-[#111827]">{lesson.state === 'done' ? 'Lesson complete' : `${done} of ${lesson.steps.length} parts done`}</p>
        </div>
        {rank && <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-bold text-[#FACC15]">Rank #{rank} of {rankTotal}</span>}
      </div>

      {/* Timeline */}
      {timeline?.configured && (
        <div className={`space-y-2 rounded-2xl border p-4 text-sm ${timeline.status === 'expired' ? 'border-rose-200 bg-rose-50' : timeline.status === 'at-risk' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-700">
            <span className={`rounded-full px-2.5 py-0.5 font-extrabold ${timeline.status === 'expired' ? 'bg-rose-600 text-white' : timeline.status === 'at-risk' ? 'bg-amber-500 text-white' : timeline.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {timeline.status === 'expired' ? 'Course expired' : timeline.status === 'at-risk' ? 'At risk · behind schedule' : timeline.status === 'completed' ? 'Completed' : 'On track'}
            </span>
            {timeline.status !== 'completed' && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-600" />Course ends {day(timeline.endingAt)}{timeline.status === 'expired' ? '' : ` · ${timeline.remainingDays} days left`}</span>}
            {timeline.status !== 'completed' && timeline.status !== 'expired' && <span>Minimum time per lesson: {timeline.minimumHours} h</span>}
          </div>
          {due && lesson.state !== 'done' && (
            <p className="flex items-center gap-2 font-bold text-[#111827]"><Clock className="h-4 w-4 text-amber-600" />This lesson is due {when(lesson.dueAt as string)} · {left(due.getTime() - Date.now())} left{lesson.allocationHours ? ` (${lesson.allocationHours} h for this lesson)` : ''}</p>
          )}
          {!!lesson.rescheduled && lesson.state !== 'done' && <p className="text-xs text-slate-600">The time for this lesson ran out, so it was recalculated from the time left. It never goes below {timeline.minimumHours} h.</p>}
          {timeline.warning && (
            <p className="flex items-start gap-2 text-xs font-bold text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{timeline.warning}{timeline.status === 'at-risk' && timeline.projectedCompletion ? ` At this pace you would finish around ${day(timeline.projectedCompletion)}.` : ''}</p>
          )}
          {needsTime && (
            lesson.pendingExtension ? (
              <p className="text-xs font-semibold text-amber-800">Request sent. Waiting for your instructor or admin to reply.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input value={extMessage} onChange={(e) => setExtMessage(e.target.value)} placeholder="Why do you need more time? (optional)" className="min-w-[200px] flex-1 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm" />
                <button type="button" disabled={sending} onClick={askForTime} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"><Send className="h-4 w-4" />Ask for more time</button>
              </div>
            )
          )}
        </div>
      )}

      {/* The six parts */}
      <ol className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
        {lesson.steps.map((step, index) => {
          const Icon = icons[step.key];
          return (
            <li key={step.key} className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 ${step.state === 'done' ? 'border-emerald-200 bg-emerald-50' : step.state === 'current' ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.state === 'done' ? 'bg-emerald-500 text-white' : step.state === 'current' ? 'bg-[#111827] text-[#FACC15]' : 'bg-slate-200 text-slate-500'}`}>
                {step.state === 'done' ? <Check className="h-4 w-4" /> : step.state === 'locked' ? <Lock className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-bold text-[#111827]"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{step.label}</span></span>
                <span className="block text-[10px] leading-snug text-slate-500">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {lesson.hint && (
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><Lock className="h-4 w-4 shrink-0 text-amber-600" />{lesson.hint}</div>
      )}

      {/* What to do now */}
      {currents.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-4 text-sm">
          {currents.map((step) => (
            <div key={step.key} className="flex items-center">
              {step.key === 'overview' && <button type="button" onClick={() => onOpenTab('overview')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Read the overview →</button>}
              {step.key === 'video' && <p className="flex items-center gap-2 text-slate-700"><PlayCircle className="h-4 w-4 text-amber-600" />Watch at least 80% of the video above.</p>}
              {step.key === 'quiz' && <button type="button" onClick={() => onOpenTab('quiz')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Take the quiz →</button>}
              {step.key === 'notes' && <button type="button" onClick={() => onOpenTab('resources')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Read the notes →</button>}
              {step.key === 'assignment' && <button type="button" onClick={() => onOpenTab('assignment')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Open the assignment →</button>}
              {step.key === 'exam' && <Link href="/exams" className="inline-block rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Go to the exam →</Link>}
            </div>
          ))}
        </div>
      )}

      {/* Live classes: always open, even when behind */}
      {lives.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Video className="h-4 w-4" />Live class</p>
          {lives.map((live) => (
            <div key={live.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="min-w-0">
                <p className="font-bold">{live.title}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{when(live.startsAt)} · {live.durationMinutes} min</p>
                {live.description && <p className="mt-1 text-xs text-slate-600">{live.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                {live.attended && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">Attended</span>}
                {live.joinUrl
                  ? <button type="button" disabled={!live.joinable} onClick={() => join(live)} className="rounded-xl bg-[#111827] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{live.joinable ? 'Join class' : 'Opens 15 min before'}</button>
                  : <span className="text-xs text-slate-500">Link coming soon</span>}
                {live.recordingUrl && <a href={live.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-sky-700 hover:underline">Watch recording</a>}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">You can join a live class even if you are behind. Assignments and exams still follow the lesson order.</p>
        </div>
      )}
      {note && <p className="text-xs font-semibold text-rose-600">{note}</p>}
    </div>
  );
}
