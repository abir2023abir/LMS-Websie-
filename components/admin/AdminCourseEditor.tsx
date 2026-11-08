'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminModal, { fieldClass } from './AdminModal';
import LessonVideoField from './LessonVideoField';
import { getFallbackCourseData } from '@/lib/progress';
import { loadCourseEdits, shrinkImage } from '@/lib/course-edits-client';
import { usdToBdt, USD_TO_BDT } from '@/lib/utils';
import type { ModuleSchema } from '@/types/course';

export default function AdminCourseEditor({
  courseId,
  onClose,
  onSaved,
}: {
  courseId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const course = getFallbackCourseData(courseId);
  const lessons = course?.modules?.flatMap((mod) => mod.lessons || []) || [];
  const [form, setForm] = useState({
    title: course?.title || '',
    price: String(usdToBdt(course?.price ?? 0)),
    originalPrice: course?.originalPrice ? String(usdToBdt(course.originalPrice)) : '',
    category: course?.category || '',
    level: course?.level || '',
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
  const blankDates = { firstEnrolled: '', lastEnrolled: '', lastCounting: '', courseEnding: '' };
  const [dates, setDates] = useState(blankDates);
  const [minHours, setMinHours] = useState(0);
  const [savingDates, setSavingDates] = useState(false);
  // <input type="datetime-local"> wants local time without a zone; the server stores real instants.
  const toLocal = (iso: string) => {
    const at = new Date(iso);
    if (Number.isNaN(at.getTime())) return '';
    return new Date(at.getTime() - at.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetch(`/api/courses/timeline?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.timeline) setDates({ firstEnrolled: toLocal(data.timeline.firstEnrolled), lastEnrolled: toLocal(data.timeline.lastEnrolled), lastCounting: toLocal(data.timeline.lastCounting), courseEnding: toLocal(data.timeline.courseEnding) });
        setMinHours(Number(data.minimumLessonHours) || 0);
      })
      .catch(() => undefined);
  }, [courseId]);

  const saveDates = async () => {
    setSavingDates(true);
    const iso = (value: string) => (value ? new Date(value).toISOString() : '');
    const res = await fetch('/api/courses/timeline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, firstEnrolled: iso(dates.firstEnrolled), lastEnrolled: iso(dates.lastEnrolled), lastCounting: iso(dates.lastCounting), courseEnding: iso(dates.courseEnding) }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingDates(false);
    if (!res.ok || !data.success) { toast.error(data.message || 'Could not save the dates'); return; }
    const fresh = await fetch(`/api/courses/timeline?courseId=${encodeURIComponent(courseId)}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
    setMinHours(Number(fresh?.minimumLessonHours) || 0);
    toast.success('Timeline dates saved.');
  };

  useEffect(() => {
    loadCourseEdits(true).then((all) => {
      const edit = all[courseId];
      if (!edit) return;
      setForm((prev) => ({
        title: edit.title || prev.title,
        price: typeof edit.price === 'number' ? String(usdToBdt(edit.price)) : prev.price,
        originalPrice: typeof edit.originalPrice === 'number' ? String(usdToBdt(edit.originalPrice)) : prev.originalPrice,
        category: edit.category || prev.category,
        level: edit.level || prev.level,
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
  }, [courseId]);

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

  const save = async () => {
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
      return;
    }
    await loadCourseEdits(true);
    onSaved?.();
    toast.success('Course saved successfully! The course page now shows the new details.');
  };

  return (
    <AdminModal title={`Edit course: ${form.title || courseId}`} onClose={onClose}>
      <div className="space-y-4">
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
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Level
            <input value={form.level} onChange={set('level')} className={fieldClass} />
          </label>
        </div>
        <label className="block space-y-1 text-xs font-bold text-slate-500">
          Description
          <textarea value={form.description} onChange={set('description')} rows={4} className={fieldClass} />
        </label>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-500">Course timeline</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-[11px] font-bold text-slate-500">First enrolled date
              <input type="datetime-local" value={dates.firstEnrolled} onChange={(e) => setDates({ ...dates, firstEnrolled: e.target.value })} className={fieldClass} />
              <span className="block font-medium">Enrollment opens</span>
            </label>
            <label className="block space-y-1 text-[11px] font-bold text-slate-500">Last enrolled date
              <input type="datetime-local" value={dates.lastEnrolled} onChange={(e) => setDates({ ...dates, lastEnrolled: e.target.value })} className={fieldClass} />
              <span className="block font-medium">No new students after this</span>
            </label>
            <label className="block space-y-1 text-[11px] font-bold text-slate-500">Last counting date
              <input type="datetime-local" value={dates.lastCounting} onChange={(e) => setDates({ ...dates, lastCounting: e.target.value })} className={fieldClass} />
              <span className="block font-medium">Used for the minimum lesson time</span>
            </label>
            <label className="block space-y-1 text-[11px] font-bold text-slate-500">Course ending date
              <input type="datetime-local" value={dates.courseEnding} onChange={(e) => setDates({ ...dates, courseEnding: e.target.value })} className={fieldClass} />
              <span className="block font-medium">Final deadline to finish</span>
            </label>
          </div>
          <p className="text-[11px] font-semibold text-amber-700">
            {minHours
              ? `Minimum lesson time: ${minHours} hours (${(minHours / 24).toFixed(2)} days) for each lesson. It changes when the dates or the lesson count change.`
              : 'Save all four dates to see the minimum time each lesson gets.'}
          </p>
          <button type="button" disabled={savingDates} onClick={saveDates} className="rounded-full bg-[#111827] px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60">{savingDates ? 'Saving…' : 'Save dates'}</button>
        </div>

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
                  <LessonVideoField
                    courseId={courseId}
                    lessonId={lesson.id}
                    value={videos[lesson.id] || lesson.videoUrl || ''}
                    onChange={(value) => setVideos((prev) => ({ ...prev, [lesson.id]: value }))}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setModules((prev) => prev.map((item) => item.id === mod.id ? { ...item, lessons: [...item.lessons, { id: `les-${Date.now()}`, title: `Lesson ${item.lessons.length + 1}`, videoUrl: '' }] } : item))}
                className="text-[11px] font-bold text-amber-700"
              >
                Add lesson to module {modIndex + 1}
              </button>
            </div>
          ))}
          <p className="text-[11px] text-slate-500">Each lesson has an overview, video, quiz, notes, assignment and exam. A part left empty is skipped. The time per lesson comes from the course timeline dates above.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-full disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
