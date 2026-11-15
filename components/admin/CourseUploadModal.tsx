'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Film, Image as ImageIcon, Layers, Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import LessonVideoField from '@/components/admin/LessonVideoField';
import CourseLengthField from './CourseLengthField';
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
  const [dates, setDates] = useState({ firstEnrolled: '', lastEnrolled: '', lastCounting: '', courseEnding: '' });
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
    const filled = Object.values(dates).filter(Boolean).length;
    if (asAdmin && filled > 0 && filled < 4) { setFormError('Fill all four timeline dates, or leave all four empty and set them later.'); return; }
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
      if (asAdmin && filled === 4) {
        const saved = await fetch('/api/courses/timeline', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: draftCourseId, ...Object.fromEntries(Object.entries(dates).map(([key, value]) => [key, new Date(value).toISOString()])) }) }).catch(() => null);
        const result = saved ? await saved.json().catch(() => ({})) : {};
        if (!saved?.ok || !result.success) notSaved.push(`The timeline dates were not saved: ${result.message || 'set them in Timeline.'}`);
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

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="my-4 w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#111827]">New course</h2>
            <p className="text-xs text-slate-500">Step 1 of 2: the course basics. Step 2 is the course builder.</p>
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

          {asAdmin && <CourseMentorSelect value={mentorEmail} onChange={setMentorEmail} />}

          {asAdmin && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Course timeline</h3>
                <p className="text-[11px] text-slate-500">Four dates that drive enrollment and the time each lesson gets. You can also set them later in the course workspace.</p>
              </div>
              <CourseLengthField dates={dates} onChange={setDates} inputClass="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none disabled:bg-slate-100" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([
                  ['firstEnrolled', 'First enrolled date', 'Enrollment opens'],
                  ['lastEnrolled', 'Last enrolled date', 'No new students after this'],
                  ['lastCounting', 'Last counting date', 'Used for the minimum lesson time'],
                  ['courseEnding', 'Course ending date', 'Final deadline to finish'],
                ] as const).map(([key, label, hint]) => (
                  <label key={key} className="block space-y-1 text-[11px] font-bold text-slate-500">{label}
                    <input type="datetime-local" value={dates[key]} onChange={(e) => setDates({ ...dates, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none" />
                    <span className="block font-medium">{hint}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Lessons are built on the next screen, where each lesson also gets its quiz, assignment and exam. */}
          <div className="flex items-start gap-3 rounded-2xl border border-[#FACC15] bg-[#FEFCE8] p-4">
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-[#A16207]" />
            <div className="text-sm text-slate-700">
              <p className="font-bold text-[#111827]">Next: lessons, quizzes, assignments and exams</p>
              <p className="mt-1 text-xs leading-relaxed">After you press the button below, the course builder opens. There you add modules and lessons, and under each lesson you add its video, quiz, assignment, exam and live class — all on one screen.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-6 py-2.5 text-sm font-extrabold text-[#111827] disabled:opacity-50">
              {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111827] border-t-transparent" /> : <Upload className="h-4 w-4" />}
              Create course and add lessons
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
