'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarClock, CheckSquare, ExternalLink, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import CoursePlacePicker, { useCourseOutline, type Place } from './CoursePlacePicker';

type LiveClass = Place & {
  id?: string; title: string; description: string; startsAt: string; durationMinutes: number;
  joinUrl: string; recordingUrl: string; attendees: string[]; published: boolean;
};
type Roster = Record<string, { id: string; name: string; email: string }[]>;

const blank = (): LiveClass => ({ courseId: '', courseTitle: '', moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '', title: '', description: '', startsAt: '', durationMinutes: 60, joinUrl: '', recordingUrl: '', attendees: [], published: true });
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500';
const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const when = (iso: string) => new Date(iso).toLocaleString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function AdminLiveClasses() {
  const outline = useCourseOutline();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [roster, setRoster] = useState<Roster>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [draft, setDraft] = useState<LiveClass | null>(null);
  const [attendance, setAttendance] = useState<{ live: LiveClass; picked: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const apply = (data: { classes?: LiveClass[]; roster?: Roster }) => { setClasses(data.classes || []); setRoster(data.roster || {}); };
  useEffect(() => {
    fetch('/api/admin/live-classes', { cache: 'no-store' }).then((res) => res.json()).then(apply)
      .catch(() => toast.error('Could not load live classes')).finally(() => setLoading(false));
  }, []);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setNote('');
    try {
      const res = await fetch('/api/admin/live-classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed.');
      apply(data);
      return true;
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const now = Date.now();
  const ended = (live: LiveClass) => new Date(live.startsAt).getTime() + live.durationMinutes * 60000 < now;
  const visible = useMemo(() => {
    const list = classes.filter((live) => (view === 'past' ? ended(live) : !ended(live)));
    return view === 'past' ? [...list].reverse() : list;
  }, [classes, view]); // eslint-disable-line react-hooks/exhaustive-deps
  const needsAttendance = classes.filter((live) => ended(live) && live.attendees.length === 0 && (roster[live.courseId]?.length || 0) > 0).length;

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-extrabold">Live classes</h2>
          <p className="text-sm text-slate-500">Schedule a live class for a lesson. Students get the join link only after they finish the lesson’s video, quiz, assignment and exam. Mark attendance afterwards to open their next lesson.</p>
        </div>
        <button type="button" onClick={() => { setNote(''); setDraft(blank()); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Schedule class</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
          <button type="button" onClick={() => setView('upcoming')} className={`rounded-lg px-3 py-1.5 ${view === 'upcoming' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Upcoming</button>
          <button type="button" onClick={() => setView('past')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${view === 'past' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Past{needsAttendance > 0 && <span className="rounded-full bg-[#FACC15] px-1.5 text-[11px] text-[#111827]">{needsAttendance}</span>}</button>
        </div>
        {needsAttendance > 0 && <p className="text-xs font-semibold text-amber-700">{needsAttendance} past class{needsAttendance > 1 ? 'es need' : ' needs'} attendance — students stay locked until you mark it.</p>}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading…</p> : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <Video className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-semibold text-slate-700">{view === 'upcoming' ? 'No upcoming classes' : 'No past classes'}</p>
          <p className="text-sm text-slate-500">Lessons without a live class need instructor approval instead.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((live) => {
            const students = roster[live.courseId] || [];
            const past = ended(live);
            return (
              <article key={live.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500"><BookOpen className="h-3 w-3 shrink-0" />{live.courseTitle} · {live.lessonTitle}</p>
                    <p className="font-bold text-slate-900">{live.title}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${!live.published ? 'bg-slate-100 text-slate-600' : past ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{!live.published ? 'Draft' : past ? 'Ended' : 'Scheduled'}</span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate-700"><CalendarClock className="h-4 w-4 text-amber-600" />{when(live.startsAt)} · {live.durationMinutes} min</p>
                {live.joinUrl ? <a href={live.joinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 truncate text-xs font-semibold text-sky-700 hover:underline"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{live.joinUrl}</a> : <p className="text-xs text-amber-700">No meeting link yet</p>}
                <div className="mt-auto flex items-center gap-1">
                  <button type="button" onClick={() => setAttendance({ live, picked: [...live.attendees] })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF9C3] px-3 py-1.5 text-xs font-bold text-[#A16207]"><CheckSquare className="h-3.5 w-3.5" />Attendance {live.attendees.length}/{students.length}</button>
                  <span className="flex-1" />
                  <button type="button" onClick={() => { setNote(''); setDraft({ ...live }); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={async () => { if (confirm('Delete this live class?') && await post({ action: 'delete', id: live.id })) toast.success('Class deleted'); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {draft && (
        <AdminModal wide title={draft.id ? 'Edit live class' : 'Schedule live class'} onClose={() => setDraft(null)}>
          <div className="space-y-4">
            <CoursePlacePicker outline={outline} value={draft} onChange={(place) => setDraft({ ...draft, ...place, title: draft.title || (place.lessonTitle ? `${place.lessonTitle} — Live class` : '') })} />
            <label className="block"><span className={labelClass}>Title</span><input className={fieldClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label><span className={labelClass}>Date & time</span><input type="datetime-local" className={fieldClass} value={toLocalInput(draft.startsAt)} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} /></label>
              <label><span className={labelClass}>Duration (minutes)</span><input type="number" min={10} className={fieldClass} value={draft.durationMinutes} onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })} /></label>
            </div>
            <label className="block"><span className={labelClass}>Meeting link (Zoom / Google Meet)</span><input className={fieldClass} value={draft.joinUrl} onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })} placeholder="https://meet.google.com/…" /></label>
            <label className="block"><span className={labelClass}>Recording link (optional, add after class)</span><input className={fieldClass} value={draft.recordingUrl} onChange={(e) => setDraft({ ...draft, recordingUrl: e.target.value })} placeholder="https://…" /></label>
            <label className="block"><span className={labelClass}>Notes for students (optional)</span><textarea className={fieldClass} rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />Published — this lesson now needs live-class attendance</label>
            {note && <p className="text-sm font-semibold text-rose-600">{note}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="button" disabled={saving} onClick={async () => { if (await post(draft as unknown as Record<string, unknown>)) { toast.success('Live class saved'); setDraft(null); } }} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </AdminModal>
      )}

      {attendance && (() => {
        const students = roster[attendance.live.courseId] || [];
        const toggle = (id: string) => setAttendance({ ...attendance, picked: attendance.picked.includes(id) ? attendance.picked.filter((x) => x !== id) : [...attendance.picked, id] });
        return (
          <AdminModal title={`Attendance: ${attendance.live.title}`} onClose={() => setAttendance(null)}>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Tick everyone who attended. Their live-class step is then done and the next lesson opens.</p>
              {students.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No students are enrolled in this course yet.</p> : (
                <>
                  <div className="flex gap-2 text-xs font-bold">
                    <button type="button" onClick={() => setAttendance({ ...attendance, picked: students.map((s) => s.id) })} className="rounded-lg bg-slate-100 px-2.5 py-1">Select all</button>
                    <button type="button" onClick={() => setAttendance({ ...attendance, picked: [] })} className="rounded-lg bg-slate-100 px-2.5 py-1">Clear</button>
                  </div>
                  <div className="max-h-80 space-y-1 overflow-y-auto">
                    {students.map((student) => (
                      <label key={student.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${attendance.picked.includes(student.id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                        <input type="checkbox" checked={attendance.picked.includes(student.id)} onChange={() => toggle(student.id)} />
                        <span className="min-w-0"><span className="block truncate text-sm font-semibold">{student.name}</span><span className="block truncate text-xs text-slate-500">{student.email}</span></span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setAttendance(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                <button type="button" disabled={saving} onClick={async () => { if (await post({ action: 'attendance', id: attendance.live.id, studentIds: attendance.picked })) { toast.success('Attendance saved'); setAttendance(null); } }} className="rounded-xl bg-[#111827] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">Save attendance ({attendance.picked.length})</button>
              </div>
            </div>
          </AdminModal>
        );
      })()}
    </section>
  );
}
