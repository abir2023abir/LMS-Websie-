'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Check, Clock, ClipboardList, GraduationCap, HelpCircle, Lock, PlayCircle, Send, UserCheck, Video } from 'lucide-react';

export type StepKey = 'video' | 'quiz' | 'assignment' | 'exam' | 'live' | 'approval';
export type Step = { key: StepKey; label: string; state: 'done' | 'current' | 'locked'; detail: string };
export type LessonProgress = { lessonId: string; lessonTitle: string; state: 'done' | 'current' | 'locked'; steps: Step[]; pendingRequest: boolean; hint?: string; moduleLessons?: number; moduleWatched?: number; dueAt?: string; overdue?: boolean; pendingExtension?: boolean };
export type LiveSession = { id: string; title: string; description: string; startsAt: string; durationMinutes: number; joinUrl: string; recordingUrl: string; attended: boolean };

const icons: Record<StepKey, typeof PlayCircle> = { video: PlayCircle, quiz: HelpCircle, assignment: ClipboardList, exam: GraduationCap, live: Video, approval: UserCheck };
const when = (iso: string) => new Date(iso).toLocaleString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * The strict path through one lesson. Videos run in order; the module's quiz, assignment, exam
 * and live class (or instructor approval) open only after every lesson of the module is watched.
 */
export default function LessonSteps({
  courseId, lesson, lives, rank, rankTotal, onOpenTab, onChanged,
}: {
  courseId: string;
  lesson: LessonProgress;
  lives: LiveSession[];
  rank: number | null;
  rankTotal: number;
  onOpenTab: (tab: 'quiz' | 'assignment') => void;
  onChanged: () => void;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState('');
  const current = lesson.steps.find((step) => step.state === 'current');
  const done = lesson.steps.filter((step) => step.state === 'done').length;

  const [extMessage, setExtMessage] = useState('');
  const dueDate = lesson.dueAt ? new Date(lesson.dueAt) : null;
  const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : 0;

  const askForTime = async () => {
    setSending(true);
    setNote('');
    try {
      const res = await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'extension', courseId, lessonId: lesson.lessonId, message: extMessage }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send.');
      setExtMessage('');
      onChanged();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Could not send.');
    } finally {
      setSending(false);
    }
  };

  const askToMoveOn = async () => {
    setSending(true);
    setNote('');
    try {
      const res = await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'request', courseId, lessonId: lesson.lessonId, message }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not send.');
      setMessage('');
      onChanged();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Could not send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Lesson path</p>
          <p className="font-display font-bold text-[#111827]">{lesson.state === 'done' ? 'Lesson complete' : `Step ${Math.min(done + 1, lesson.steps.length)} of ${lesson.steps.length}`}</p>
        </div>
        {rank && <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-bold text-[#FACC15]">Rank #{rank} of {rankTotal}</span>}
      </div>

      {/* Deadline */}
      {dueDate && lesson.state !== 'done' && (
        lesson.overdue ? (
          <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold text-rose-800"><Clock className="h-4 w-4" />The deadline for this lesson was {dueDate.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })}. You can still continue, but please ask for more time.</p>
            {lesson.pendingExtension ? (
              <p className="font-semibold text-amber-800">Request sent — waiting for your instructor to give you more time.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <input value={extMessage} onChange={(e) => setExtMessage(e.target.value)} placeholder="Why do you need more time? (optional)" className="min-w-[200px] flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm" />
                <button type="button" disabled={sending} onClick={askForTime} className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50"><Send className="h-4 w-4" />Request more time</button>
              </div>
            )}
            {note && <p className="text-xs font-semibold text-rose-600">{note}</p>}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Clock className="h-3.5 w-3.5 text-amber-600" />Finish by {dueDate.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short' })} · {daysLeft} day{daysLeft === 1 ? '' : 's'} left</p>
        )
      )}

      {/* Step track */}
      <ol className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(110px,1fr))]">
        {lesson.steps.map((step, index) => {
          const Icon = icons[step.key];
          return (
            <li key={step.key} className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 ${step.state === 'done' ? 'border-emerald-200 bg-emerald-50' : step.state === 'current' ? 'border-[#FACC15] bg-[#FEF9C3]' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.state === 'done' ? 'bg-emerald-500 text-white' : step.state === 'current' ? 'bg-[#111827] text-[#FACC15]' : 'bg-slate-200 text-slate-500'}`}>
                {step.state === 'done' ? <Check className="h-4 w-4" /> : step.state === 'locked' ? <Lock className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-bold text-[#111827]"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{step.label}</span></span>
                <span className="block truncate text-[10px] text-slate-500">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {!current && lesson.hint && (
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><Lock className="h-4 w-4 shrink-0 text-amber-600" />{lesson.hint}</div>
      )}

      {/* What to do now */}
      {current && (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
          {current.key === 'video' && <p className="flex items-center gap-2 text-slate-700"><PlayCircle className="h-4 w-4 text-amber-600" />Watch at least 80% of the video above.{lesson.moduleLessons && lesson.moduleLessons > 1 ? ` The quizzes and assignments open after all ${lesson.moduleLessons} lessons of this module are watched (${lesson.moduleWatched ?? 0} of ${lesson.moduleLessons} so far).` : ' The quiz opens after that.'}</p>}
          {current.key === 'quiz' && <button type="button" onClick={() => onOpenTab('quiz')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Take the quiz →</button>}
          {current.key === 'assignment' && <button type="button" onClick={() => onOpenTab('assignment')} className="rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Open the assignment →</button>}
          {current.key === 'exam' && <Link href="/exams" className="inline-block rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827]">Go to the exam →</Link>}
          {current.key === 'live' && (
            <div className="space-y-2">
              {lives.map((live) => (
                <div key={live.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="font-bold">{live.title}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarClock className="h-3.5 w-3.5" />{when(live.startsAt)} · {live.durationMinutes} min</p>
                    {live.description && <p className="mt-1 text-xs text-slate-600">{live.description}</p>}
                  </div>
                  {live.joinUrl ? <a href={live.joinUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#111827] px-4 py-2 text-xs font-bold text-white">Join class</a> : <span className="text-xs text-slate-500">Link coming soon</span>}
                  {live.recordingUrl && <a href={live.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-sky-700 hover:underline">Watch recording</a>}
                </div>
              ))}
              <p className="text-xs text-slate-500">Your instructor marks attendance after the class — then the next lesson opens.</p>
            </div>
          )}
          {current.key === 'approval' && (
            lesson.pendingRequest ? (
              <p className="flex items-center gap-2 font-semibold text-amber-800"><UserCheck className="h-4 w-4" />Request sent — waiting for your instructor to open the next module.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-700">This module has no live class. Ask your instructor to open the next module.</p>
                <div className="flex flex-wrap gap-2">
                  <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message to your instructor (optional)" className="min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <button type="button" disabled={sending} onClick={askToMoveOn} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-4 py-2 text-sm font-extrabold text-[#111827] disabled:opacity-50"><Send className="h-4 w-4" />Ask to move on</button>
                </div>
                {note && <p className="text-xs font-semibold text-rose-600">{note}</p>}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
