'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import LessonVideoField from './LessonVideoField';
import LessonToolsBar, { type ToolCommand, type ToolItems, type ToolKind } from './LessonTools';
import { getFallbackCourseData } from '@/lib/progress';
import { loadCourseEdits, shrinkImage } from '@/lib/course-edits-client';
import { usdToBdt, USD_TO_BDT } from '@/lib/utils';
import type { ModuleSchema } from '@/types/course';

export default function AdminCourseEditor({
  courseId,
  onClose,
  onSaved,
  bare = false,
  view = 'details',
  lessonTools,
}: {
  courseId: string;
  onClose: () => void;
  onSaved?: () => void;
  /** Inside the course workspace: no modal frame, and only the part named by `view` is shown. */
  bare?: boolean;
  view?: 'details' | 'timeline' | 'curriculum';
  /** Lets each lesson show and add its quiz, assignment, exam and live class (course workspace). */
  lessonTools?: { kinds: ToolKind[]; items: ToolItems; open: (kind: ToolKind, command: Omit<ToolCommand, 'nonce'>) => void };
}) {
  const course = getFallbackCourseData(courseId);
  const lessons = course?.modules?.flatMap((mod) => mod.lessons || []) || [];
  const [form, setForm] = useState({
    title: course?.title || '',
    price: String(usdToBdt(course?.price ?? 0)),
    originalPrice: course?.originalPrice ? String(usdToBdt(course.originalPrice)) : '',
    category: course?.category || '',
    description: course?.description || '',
    thumbnail: course?.thumbnail || '',
  });
  const [videos, setVideos] = useState<Record<string, string>>(
    Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson.videoUrl || ''])),
  );
  const [modules, setModules] = useState<ModuleSchema[]>(
    (course?.modules || []).map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((lesson) => ({ ...lesson })),
    })),
  );
  const [busy, setBusy] = useState(false);
  // Day-wise timeline: the course length in days, counted from each student's own enrollment.
  const [accessDays, setAccessDays] = useState('');
  const [savedAccessDays, setSavedAccessDays] = useState(0);
  const [savingDays, setSavingDays] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/timeline?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const days = Number(data.accessDays) || 0;
        setSavedAccessDays(days);
        setAccessDays(days ? String(days) : '');
      })
      .catch(() => undefined);
  }, [courseId]);

  const saveDays = async () => {
    const days = Math.round(Number(accessDays) || 0);
    if (accessDays !== '' && (days < 1 || days > 3650)) { toast.error('Course length must be between 1 and 3650 days.'); return; }
    setSavingDays(true);
    const res = await fetch('/api/courses/timeline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, accessDays: days }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingDays(false);
    if (!res.ok || !data.success) { toast.error(data.message || 'Could not save the course length'); return; }
    setSavedAccessDays(days);
    toast.success(days ? `Course length saved: ${days} days from each student's enrollment.` : 'Course length removed.');
  };

  useEffect(() => {
    fetch(`/api/courses/${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then(async (data) => {
        const stored = data?.course;
        // getFallbackCourseData() invents a placeholder course for ids it does not know, so the stored course wins.
        if (stored) {
          setForm((prev) => ({
            ...prev,
            title: stored.title || prev.title,
            price: typeof stored.price === 'number' ? String(usdToBdt(stored.price)) : prev.price,
            category: stored.category || prev.category,
            description: stored.description || prev.description,
            thumbnail: stored.thumbnail || prev.thumbnail,
          }));
        }
        if (stored && Array.isArray(stored.modules) && stored.modules.length) {
          setModules(stored.modules.map((mod: ModuleSchema) => ({ ...mod, lessons: (mod.lessons || []).map((lesson) => ({ ...lesson })) })));
          setVideos(Object.fromEntries(stored.modules.flatMap((mod: ModuleSchema) => (mod.lessons || []).map((lesson) => [lesson.id, lesson.videoUrl || '']))));
        }
        return loadCourseEdits(true);
      })
      .then((all) => {
      const edit = all[courseId];
      if (!edit) return;
      setForm((prev) => ({
        title: edit.title || prev.title,
        price: typeof edit.price === 'number' ? String(usdToBdt(edit.price)) : prev.price,
        originalPrice: typeof edit.originalPrice === 'number' ? String(usdToBdt(edit.originalPrice)) : prev.originalPrice,
        category: edit.category || prev.category,
        description: edit.description || prev.description,
        thumbnail: edit.thumbnail || prev.thumbnail,
      }));
      setVideos((prev) => ({ ...prev, ...edit.videos }));
      if (Array.isArray(edit.modules) && edit.modules.length) {
        setModules(edit.modules.map((mod) => ({
          ...mod,
          lessons: (mod.lessons || []).map((lesson) => ({ ...lesson })),
        })));
      }
    });
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    try {
      const thumbnail = await shrinkImage(picked);
      setForm((prev) => ({ ...prev, thumbnail }));
      toast.success('Picture ready! Press Save to keep it.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to process image');
    }
  };

  // What was last sent to the server, so adding a quiz to a lesson only saves the lessons when they changed.
  const savedSnapshot = useRef('');
  const snapshot = () => JSON.stringify({ form, videos, modules });

  const save = async (quiet = false): Promise<boolean> => {
    const sending = snapshot();
    if (quiet && sending === savedSnapshot.current) return true;
    setBusy(true);
    const toUsd = (bdt: string) => (bdt === '' ? undefined : Math.round(Number(bdt) / USD_TO_BDT));
    const res = await fetch('/api/courses/edits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        ...form,
        price: toUsd(form.price),
        originalPrice: toUsd(form.originalPrice),
        videos,
        modules: modules.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((lesson) => ({ ...lesson, videoUrl: videos[lesson.id] ?? lesson.videoUrl })),
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.success) {
      toast.error(data.message || 'Could not save course details');
      return false;
    }
    savedSnapshot.current = sending;
    await loadCourseEdits(true);
    onSaved?.();
    if (!quiet) toast.success('Course saved successfully! The course page now shows the new details.');
    return true;
  };

  // Lesson builder: the lesson must exist on the server before something is attached to it.
  const openTool = async (kind: ToolKind, command: Omit<ToolCommand, 'nonce'>) => {
    if (!lessonTools) return;
    if (command.action === 'new' && !(await save(true))) return;
    lessonTools.open(kind, command);
  };
  const toolsAt = (moduleId: string, lessonId: string) => Object.fromEntries((lessonTools?.kinds || []).map((kind) => [kind, (lessonTools?.items[kind] || []).filter((item) => (item.moduleId || '') === moduleId && (item.lessonId || '') === lessonId)])) as Partial<ToolItems>;
  const addLabel: Record<ToolKind, string> = { quiz: 'Quiz', assignment: 'Assignment', exam: 'Exam', live: 'Live class' };

  const detailsPart = (
    <>
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {form.thumbnail && <img src={form.thumbnail} alt="" className="w-full h-full object-cover" />}
          </div>
          <label className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full cursor-pointer">
            Upload picture
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pickImage} />
          </label>
        </div>

        <label className="block space-y-1 text-xs font-bold text-slate-500">
          Course name
          <input value={form.title} onChange={set('title')} className={fieldClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Price (টাকা)
            <input value={form.price} onChange={set('price')} type="number" min="0" className={fieldClass} />
          </label>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Old price (টাকা)
            <input value={form.originalPrice} onChange={set('originalPrice')} type="number" min="0" className={fieldClass} />
          </label>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Category
            <input value={form.category} onChange={set('category')} className={fieldClass} />
          </label>
        </div>
        <label className="block space-y-1 text-xs font-bold text-slate-500">
          Description
          <textarea value={form.description} onChange={set('description')} rows={4} className={fieldClass} />
        </label>
    </>
  );

  const allLessons = modules.flatMap((mod) => mod.lessons);
  const lessonDaysTotal = allLessons.reduce((sum, lesson) => sum + (Number(lesson.days) || 0), 0);
  const lessonsWithDays = allLessons.filter((lesson) => Number(lesson.days) > 0).length;
  const lengthDays = Number(accessDays) || lessonDaysTotal;
  const timelinePart = (
    <>
        <div className="space-y-4 rounded-3xl border border-[#FACC15] bg-[#FEFCE8] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#A16207]">Course timeline</p>
            <p className="mt-1 text-sm text-slate-600">Counted in days from the day each student enrolls, so a student who joins later still gets the full time.</p>
          </div>
          <label className="block space-y-1 text-xs font-bold text-slate-600">Course length (days)
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={3650} value={accessDays} onChange={(e) => setAccessDays(e.target.value)} placeholder={lessonDaysTotal ? String(lessonDaysTotal) : 'e.g. 30'} className={`${fieldClass} max-w-[9rem]`} />
              <span className="text-sm font-semibold text-slate-600">days</span>
            </div>
          </label>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li><span className="font-bold text-[#111827]">{allLessons.length}</span> lesson{allLessons.length === 1 ? '' : 's'}{lessonsWithDays ? ` · ${lessonsWithDays} with their own days (${lessonDaysTotal} days in total)` : ''}</li>
            {lengthDays > 0 && allLessons.length > lessonsWithDays && (
              <li>Each of the {allLessons.length - lessonsWithDays} lesson{allLessons.length - lessonsWithDays === 1 ? '' : 's'} without its own days gets about <span className="font-bold text-[#111827]">{Math.max(0, Math.round(((lengthDays - lessonDaysTotal) / (allLessons.length - lessonsWithDays)) * 10) / 10)} days</span>.</li>
            )}
            {Number(accessDays) > 0 && lessonDaysTotal > Number(accessDays) && (
              <li className="font-semibold text-rose-700">The lessons add up to {lessonDaysTotal} days, more than the course length.</li>
            )}
            {!accessDays && lessonDaysTotal > 0 && <li>Without a course length, the course lasts as long as the lesson days add up to.</li>}
          </ul>
          <button type="button" disabled={savingDays || Math.round(Number(accessDays) || 0) === savedAccessDays} onClick={saveDays} className="rounded-full bg-[#111827] px-5 py-2 text-xs font-bold text-white disabled:opacity-50">{savingDays ? 'Saving…' : 'Save course length'}</button>
          <p className="text-[11px] leading-relaxed text-slate-500">Set days for a lesson in the box beside it in the curriculum, then press Save there.</p>
        </div>
    </>
  );

  const curriculumPart = (
    <>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-500">Modules and lessons</p>
            <button
              type="button"
              onClick={() => setModules((prev) => [...prev, { id: `mod-${Date.now()}`, title: `Module ${prev.length + 1}`, lessons: [] }])}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold"
            >
              Add module
            </button>
          </div>
          {modules.map((mod, modIndex) => (
            <div key={mod.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex gap-2">
                <input
                  value={mod.title}
                  onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, title: e.target.value } : item))}
                  className={fieldClass}
                />
                <button type="button" onClick={() => setModules((prev) => prev.filter((item) => item.id !== mod.id))} className="text-xs font-bold text-rose-600">Remove</button>
              </div>
              {mod.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="space-y-1 rounded-xl bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={lesson.title}
                      onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, title: e.target.value } : row) } : item))}
                      className={`${fieldClass} min-w-0 flex-1`}
                    />
                    <label className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#FACC15] bg-[#FEFCE8] px-2 py-1 text-[11px] font-bold text-[#A16207]" title="Days this lesson gets. Leave empty to share the course length evenly.">
                      Days
                      <input
                        type="number"
                        min={0}
                        max={365}
                        value={lesson.days || ''}
                        onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, days: Math.max(0, Math.min(365, Math.round(Number(e.target.value) || 0))) || undefined } : row) } : item))}
                        placeholder="–"
                        aria-label={`Days for ${lesson.title}`}
                        className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-semibold text-[#111827] focus:border-[#111827] focus:outline-none"
                      />
                    </label>
                    <button type="button" onClick={() => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.filter((row) => row.id !== lesson.id) } : item))} className="text-[11px] font-bold text-rose-600">Remove</button>
                  </div>
                  <textarea
                    value={lesson.overview || ''}
                    onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, overview: e.target.value } : row) } : item))}
                    rows={2}
                    placeholder="Overview (optional). The student reads it and confirms before the quiz opens."
                    className={fieldClass}
                  />
                  <textarea
                    value={lesson.notes || ''}
                    onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, notes: e.target.value } : row) } : item))}
                    rows={2}
                    placeholder="Notes and resource links (optional). Opens after the quiz is passed."
                    className={fieldClass}
                  />
                  <textarea
                    value={lesson.actionSteps || ''}
                    onChange={(e) => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, actionSteps: e.target.value } : row) } : item))}
                    rows={2}
                    placeholder="Action steps for this lesson (optional), one per line. Students see them under the overview."
                    className={fieldClass}
                  />
                  {(lesson.moreVideos?.length || 0) > 0 && <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Video 1</p>}
                  <LessonVideoField
                    courseId={courseId}
                    lessonId={lesson.id}
                    value={videos[lesson.id] || lesson.videoUrl || ''}
                    onChange={(value) => setVideos((prev) => ({ ...prev, [lesson.id]: value }))}
                  />
                  {/* Video 2, 3, …: the student watches each one to finish the video step. */}
                  {(lesson.moreVideos || []).map((video, videoIndex) => {
                    const setVideo = (patch: Partial<typeof video> | null) => setModules((prev) => prev.map((item) => item.id === mod.id ? {
                      ...item,
                      lessons: item.lessons.map((row) => row.id === lesson.id ? {
                        ...row,
                        moreVideos: patch === null
                          ? (row.moreVideos || []).filter((entry) => entry.id !== video.id)
                          : (row.moreVideos || []).map((entry) => entry.id === video.id ? { ...entry, ...patch } : entry),
                      } : row),
                    } : item));
                    return (
                      <div key={video.id} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">Video {videoIndex + 2}</span>
                          <input value={video.title} onChange={(e) => setVideo({ title: e.target.value })} placeholder="Title (optional), e.g. Part 2: Practice" className={`${fieldClass} min-w-0 flex-1`} />
                          <button type="button" onClick={() => setVideo(null)} className="shrink-0 text-[11px] font-bold text-rose-600">Remove</button>
                        </div>
                        <LessonVideoField courseId={courseId} lessonId={lesson.id} value={video.url} onChange={(value) => setVideo({ url: value })} />
                      </div>
                    );
                  })}
                  {(lesson.moreVideos?.length || 0) < 10 && (
                    <button
                      type="button"
                      onClick={() => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.map((row) => row.id === lesson.id ? { ...row, moreVideos: [...(row.moreVideos || []), { id: `v${Date.now().toString(36)}`, title: '', url: '' }] } : row) } : item))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-[#111827] hover:text-[#111827]"
                    >
                      + Add another video
                    </button>
                  )}
                  {lessonTools && (
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">In this lesson</p>
                      <LessonToolsBar
                        kinds={lessonTools.kinds}
                        items={toolsAt(mod.id, lesson.id)}
                        busy={busy}
                        onEdit={(kind, id) => openTool(kind, { action: 'edit', id })}
                        onAdd={(kind) => openTool(kind, { action: 'new', title: `${lesson.title} — ${addLabel[kind]}`, place: { courseId, courseTitle: form.title, moduleId: mod.id, moduleTitle: mod.title, lessonId: lesson.id, lessonTitle: lesson.title } })}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: [...item.lessons, { id: `les-${Date.now()}`, title: `Lesson ${item.lessons.length + 1}`, videoUrl: '' }] } : item))}
                className="text-[11px] font-bold text-amber-700"
              >
                Add lesson to module {modIndex + 1}
              </button>
              {lessonTools?.kinds.includes('exam') && (
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Module exam</p>
                  <LessonToolsBar
                    kinds={['exam']}
                    items={toolsAt(mod.id, '')}
                    busy={busy}
                    onEdit={(kind, id) => openTool(kind, { action: 'edit', id })}
                    onAdd={(kind) => openTool(kind, { action: 'new', title: `${mod.title} — Exam`, place: { courseId, courseTitle: form.title, moduleId: mod.id, moduleTitle: mod.title, lessonId: '', lessonTitle: '' } })}
                  />
                </div>
              )}
            </div>
          ))}
          {lessonTools?.kinds.includes('exam') && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Course final exam</p>
              <LessonToolsBar
                kinds={['exam']}
                items={toolsAt('', '')}
                busy={busy}
                onEdit={(kind, id) => openTool(kind, { action: 'edit', id })}
                onAdd={(kind) => openTool(kind, { action: 'new', title: `${form.title} — Final exam`, place: { courseId, courseTitle: form.title, moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '' } })}
              />
              <p className="basis-full text-[11px] text-slate-500">Opens for a student only after every lesson of the course is finished.</p>
            </div>
          )}
          <p className="text-[11px] text-slate-500">Each lesson has an overview, video, quiz, notes, assignment and exam. A part left empty is skipped. The days a lesson gets come from the box beside it, or an even share of the course length.</p>
        </div>
    </>
  );

  const saveBar = (
    <>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => save()}
            className="bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-full disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
    </>
  );

  if (bare) {
    return (
      <div className="space-y-4">
        {view === 'details' && <>{detailsPart}{saveBar}</>}
        {view === 'timeline' && timelinePart}
        {view === 'curriculum' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0 space-y-4">{curriculumPart}{saveBar}</div>
            {/* The course timeline sits on the right; on a phone it comes first. */}
            <div className="order-first lg:order-none lg:sticky lg:top-4">{timelinePart}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminModal title={`Edit course: ${form.title || courseId}`} onClose={onClose}>
      <div className="space-y-4">
        {detailsPart}
        {timelinePart}
        {curriculumPart}
        {saveBar}
      </div>
    </AdminModal>
  );
}
