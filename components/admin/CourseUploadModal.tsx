'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Film, Image as ImageIcon, Layers, Plus, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LessonVideoField from '@/components/admin/LessonVideoField';
import { USD_TO_BDT, usdToBdt } from '@/lib/utils';
import type { LessonSchema, ModuleSchema } from '@/types/course';

const freshId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const starterModules = (): ModuleSchema[] => [
  {
    id: 'mod-1',
    title: 'Module 1: Getting Started',
    lessons: [{ id: 'les-1', title: 'Welcome to Career Bridge.Studio', videoUrl: '', duration: '05:30', days: 2 }],
  },
];

export default function CourseUploadModal({
  asAdmin,
  onClose,
  onCreated,
}: {
  asAdmin: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { userProfile, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(String(usdToBdt(49)));
  const [category, setCategory] = useState('Accounting');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleSchema[]>(starterModules);
  const [draftCourseId, setDraftCourseId] = useState(freshId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    setThumbnailUrl(objectUrl);
  };

  const addModule = () => {
    setModules((current) => [...current, { id: `mod-${Date.now()}`, title: `Module ${current.length + 1}: New Topic`, lessons: [] }]);
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof LessonSchema, value: string | number) => {
    setModules((current) => current.map((mod) => mod.id === moduleId
      ? { ...mod, lessons: mod.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson) }
      : mod));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!title.trim()) { setFormError('Please enter a course title.'); return; }
    if (!description.trim()) { setFormError('Please provide a course description.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftCourseId,
          title,
          description,
          instructorId: user?.uid || (asAdmin ? 'admin' : 'instructor-demo'),
          instructorName: userProfile?.name || user?.displayName || (asAdmin ? 'Admin' : 'Teacher'),
          price: Math.round(Number(price) / USD_TO_BDT) || 0,
          thumbnail: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop',
          category,
          level,
          modules,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create course');
      setFormSuccess('Course uploaded successfully!');
      onCreated();
      setTimeout(onClose, 700);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong while creating the course.');
    } finally {
      setSubmitting(false);
      setDraftCourseId(freshId());
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="my-4 w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#111827]">Upload New Course</h2>
            <p className="text-xs text-slate-500">Add the course here. You stay in this panel.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {formSuccess && <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle className="h-5 w-5" />{formSuccess}</div>}
        {formError && <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"><AlertCircle className="h-5 w-5" />{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Course Title *</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Foundations of Bookkeeping & Accounting" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#111827] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#111827] focus:outline-none">
                <option>Accounting</option><option>Business</option><option>Digital Skills</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Price (টাকা) *</label>
              <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#111827] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Skill Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#111827] focus:outline-none">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Thumbnail Image</label>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600">
                  <ImageIcon className="h-4 w-4 text-amber-600" /> Choose File
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </label>
                <input type="url" value={thumbnailUrl} onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailPreview(e.target.value); }} placeholder="Or paste Image URL..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs focus:border-[#111827] focus:outline-none" />
              </div>
              {thumbnailPreview && (
                <div className="relative mt-3 h-20 w-32 overflow-hidden rounded-xl border border-slate-200">
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Description *</label>
              <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What students will learn in this course" className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-[#111827] focus:outline-none" />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold"><Layers className="h-4 w-4 text-amber-600" /> Modules and lessons</h3>
              <button type="button" onClick={addModule} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold"><Plus className="h-3.5 w-3.5" /> Add Module</button>
            </div>
            <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
              {modules.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <input value={mod.title} onChange={(e) => setModules((current) => current.map((item) => item.id === mod.id ? { ...item, title: e.target.value } : item))} placeholder={`Module ${modIdx + 1} Title`} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold focus:border-[#111827] focus:outline-none" />
                    <button type="button" onClick={() => setModules((current) => current.filter((item) => item.id !== mod.id))} className="text-slate-400 hover:text-rose-500" aria-label="Delete module"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-2 border-l-2 border-[#FACC15] pl-4">
                    {mod.lessons.map((lesson, lesIdx) => {
                      const due = mod.lessons.slice(0, lesIdx + 1).reduce((sum, item) => sum + (Number(item.days) || 2), 0);
                      return (
                        <div key={lesson.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                          <Film className="hidden h-4 w-4 text-slate-400 sm:block" />
                          <input value={lesson.title} onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)} placeholder={`Lesson ${lesIdx + 1} Title`} className="min-w-[10rem] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:border-[#111827] focus:outline-none" />
                          <label className="flex items-center gap-1 font-bold text-slate-500">Days
                            <input type="number" min="1" value={lesson.days || 2} onChange={(e) => updateLesson(mod.id, lesson.id, 'days', Math.max(1, Number(e.target.value) || 1))} className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5" />
                          </label>
                          <span className="basis-full text-[11px] font-semibold text-amber-700">Finish by day {due} of this module</span>
                          <button type="button" onClick={() => setModules((current) => current.map((item) => item.id === mod.id ? { ...item, lessons: item.lessons.filter((row) => row.id !== lesson.id) } : item))} className="text-slate-400 hover:text-rose-500" aria-label="Remove lesson"><X className="h-3.5 w-3.5" /></button>
                          <LessonVideoField className="basis-full" courseId={draftCourseId} lessonId={lesson.id} value={lesson.videoUrl} onChange={(value) => updateLesson(mod.id, lesson.id, 'videoUrl', value)} />
                        </div>
                      );
                    })}
                    <button type="button" onClick={() => setModules((current) => current.map((item) => item.id === mod.id ? { ...item, lessons: [...item.lessons, { id: `les-${Date.now()}`, title: `Lesson ${item.lessons.length + 1}: Video Lecture`, videoUrl: '', duration: '10:00', days: 2 }] } : item))} className="flex items-center gap-1 pt-1 text-xs font-bold text-amber-600"><Plus className="h-3.5 w-3.5" /> Add Video Lesson</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-6 py-2.5 text-sm font-extrabold text-[#111827] disabled:opacity-50">
              {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111827] border-t-transparent" /> : <Upload className="h-4 w-4" />}
              Publish Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
