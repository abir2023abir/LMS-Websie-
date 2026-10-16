'use client';

import { useEffect, useState } from 'react';
import AdminModal, { fieldClass } from './AdminModal';
import { getFallbackCourseData } from '@/lib/progress';
import { loadCourseEdits, shrinkImage } from '@/lib/course-edits-client';
import { usdToBdt, USD_TO_BDT } from '@/lib/utils';

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
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

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
      setNote('Picture ready. Press Save to keep it.');
    } catch (err: any) {
      setNote(err.message);
    }
  };

  const save = async () => {
    setBusy(true);
    setNote('');
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
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.success) {
      setNote(data.message || 'Could not save.');
      return;
    }
    await loadCourseEdits(true);
    onSaved?.();
    setNote('Saved. The course page shows the new details.');
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

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">Lesson videos (YouTube or mp4 link)</p>
          {lessons.map((lesson) => (
            <label key={lesson.id} className="block space-y-1 text-[11px] font-semibold text-slate-600">
              {lesson.title}
              <input
                value={videos[lesson.id] || ''}
                onChange={(e) => setVideos((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                className={`${fieldClass} text-xs`}
              />
            </label>
          ))}
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
          {note && <p className="text-xs font-semibold">{note}</p>}
        </div>
      </div>
    </AdminModal>
  );
}
