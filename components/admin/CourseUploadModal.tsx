'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Film, Image as ImageIcon, Layers, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import LessonVideoField from '@/components/admin/LessonVideoField';
import { CourseMentorSelect, saveCourseMentor } from './CourseMentorField';
import { USD_TO_BDT, usdToBdt } from '@/lib/utils';
import type { LessonSchema, ModuleSchema } from '@/types/course';

const freshId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const starterModules = (): ModuleSchema[] => [
  {
    id: `mod-${Date.now()}`,
    title: 'Module 1',
    lessons: [{ id: `les-${Date.now()}`, title: 'Lesson 1', videoUrl: '' }],
  },
];

export default function CourseUploadModal({
  asAdmin,
  onClose,
  onCreated,
}: {
  asAdmin: boolean;
  onClose: () => void;
  /** Receives the new course's id, so the caller can open its workspace. */
  onCreated: (courseId: string) => void;
}) {
  const { userProfile, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(String(usdToBdt(49)));
  const [category, setCategory] = useState('Accounting');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [modules, setModules] = useState<ModuleSchema[]>(starterModules);
  const [draftCourseId, setDraftCourseId] = useState(freshId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  // Day-wise timeline: the course length in days, counted from each student's own enrollment.
  const [accessDays, setAccessDays] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');

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
    const days = Math.round(Number(accessDays) || 0);
    if (accessDays !== '' && (days < 1 || days > 3650)) { setFormError('Course length must be between 1 and 3650 days.'); return; }
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
          modules,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create course');
      // From here the course exists. A date or mentor that could not be saved must not keep the
      // person on this form (pressing the button again would make a second course): they are
      // told what is missing and taken to the builder, where both can be set.
      const notSaved: string[] = [];
      if (days > 0) {
        const saved = await fetch('/api/courses/timeline', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: draftCourseId, accessDays: days }) }).catch(() => null);
        const result = saved ? await saved.json().catch(() => ({})) : {};
        if (!saved?.ok || !result.success) notSaved.push(`The course length was not saved: ${result.message || 'set it in Timeline.'}`);
      }
      if (asAdmin && mentorEmail) {
        await saveCourseMentor(draftCourseId, mentorEmail).catch((error) => { notSaved.push(`The mentor was not saved: ${error instanceof Error ? error.message : 'choose the mentor in Mentor.'}`); });
      }
      notSaved.forEach((message) => toast.error(`The course was created. ${message}`, { duration: 15000 }));
      setFormSuccess('Course created. Opening the course builder…');
      onCreated(draftCourseId);
      setTimeout(onClose, 700);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong while creating the course.');
    } finally {
      setSubmitting(false);
      setDraftCourseId(freshId());
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#111827] focus:outline-none';
  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700';

  // Drawn on <body> so it covers the whole window, whatever the panel around it does.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="New course" className="fixed inset-0 z-[80] flex flex-col bg-slate-100 text-slate-900">
      <header className="shrink-0 bg-[#111827] text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FACC15]">New course · step 1 of 2</p>
            <h2 className="truncate font-display text-lg font-extrabold sm:text-2xl">{title.trim() || 'Course basics'}</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/20" aria-label="Close">
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6">
          {formSuccess && <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle className="h-5 w-5" />{formSuccess}</div>}
          {formError && <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"><AlertCircle className="h-5 w-5" />{formError}</div>}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
            {/* Left: the course basics */}
            <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="font-display text-lg font-extrabold">Course details</h3>
              <div>
                <label className={labelClass}>Course title *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Foundations of Bookkeeping & Accounting" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    <option>Accounting</option><option>Business</option><option>Digital Skills</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Price (টাকা) *</label>
                  <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description *</label>
                <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What students will learn in this course" className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Thumbnail image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
                    <ImageIcon className="h-4 w-4 text-amber-600" /> Choose file
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                  </label>
                  <input type="url" value={thumbnailUrl} onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailPreview(e.target.value); }} placeholder="Or paste an image link…" className={inputClass} />
                </div>
                {thumbnailPreview && (
                  <div className="relative mt-3 aspect-video w-48 overflow-hidden rounded-xl border border-slate-200">
                    <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </section>

            {/* Right: timeline, mentor and what comes next */}
            <aside className="space-y-5 lg:sticky lg:top-0">
              <section className="space-y-3 rounded-3xl border border-[#FACC15] bg-[#FEFCE8] p-5">
                <div>
                  <h3 className="font-display text-base font-extrabold">Course timeline</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">How many days a student gets, counted from the day they enroll. Someone who joins 10 days later still gets the full time.</p>
                </div>
                <label className="block space-y-1 text-xs font-bold text-slate-600">Course length
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={3650} value={accessDays} onChange={(e) => setAccessDays(e.target.value)} placeholder="e.g. 30" className={`${inputClass} max-w-[9rem]`} />
                    <span className="text-sm font-semibold text-slate-600">days</span>
                  </div>
                </label>
                <p className="text-[11px] leading-relaxed text-slate-500">You can also give each lesson its own days (2, 3, 4 …) in the course builder. Leave this empty to set it later.</p>
              </section>

              {asAdmin && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <CourseMentorSelect value={mentorEmail} onChange={setMentorEmail} />
                </section>
              )}

              <section className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <Layers className="mt-0.5 h-5 w-5 shrink-0 text-[#A16207]" />
                <div className="text-sm text-slate-700">
                  <p className="font-bold text-[#111827]">Next: the course builder</p>
                  <p className="mt-1 text-xs leading-relaxed">Add Module 1, then its lessons. Under each lesson add its video, quiz, assignment, exam and live class — all on one screen.</p>
                </div>
              </section>
            </aside>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl justify-end gap-3 px-4 py-4 sm:px-6">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-extrabold text-[#111827] disabled:opacity-50">
              {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111827] border-t-transparent" /> : <Upload className="h-4 w-4" />}
              Create course and open the builder
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
