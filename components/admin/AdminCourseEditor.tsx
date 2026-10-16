'use client';

import { useState } from 'react';
import { featuredCourses } from '@/lib/data';
import { getFallbackCourseData } from '@/lib/progress';
import { courseEdit, saveCourseMeta, saveLessonVideo } from '@/lib/workspace';
import { usdToBdt, USD_TO_BDT } from '@/lib/utils';

export default function AdminCourseEditor() {
  const [courseId, setCourseId] = useState(featuredCourses[0]?.id || '1');
  const [note, setNote] = useState('');
  const course = getFallbackCourseData(courseId);
  const saved = courseEdit(courseId);
  const [title, setTitle] = useState(saved.title || course?.title || '');
  const [price, setPrice] = useState(String(usdToBdt(saved.price ?? course?.price ?? 0)));

  const choose = (id: string) => {
    setCourseId(id);
    const next = getFallbackCourseData(id);
    const edit = courseEdit(id);
    setTitle(edit.title || next?.title || '');
    setPrice(String(usdToBdt(edit.price ?? next?.price ?? 0)));
    setNote('');
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div>
        <h2 className="font-display font-extrabold text-xl">Edit a course and its videos</h2>
        <p className="text-xs text-slate-500">Paste a YouTube or video link for any lesson. It plays in that course.</p>
      </div>
      <select value={courseId} onChange={(e) => choose(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
        {featuredCourses.map((item) => (
          <option key={item.id} value={item.id}>{item.title}</option>
        ))}
      </select>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price in টাকা" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <button
        type="button"
        className="bg-[#111827] text-white text-xs font-bold px-4 py-2 rounded-full"
        onClick={() => {
          saveCourseMeta(courseId, title, Math.round(Number(price) / USD_TO_BDT) || 0);
          setNote('Course details saved.');
        }}
      >
        Save course details
      </button>
      <div className="space-y-3">
        {course?.modules?.flatMap((mod) => mod.lessons || []).map((lesson) => (
          <form
            key={lesson.id}
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const field = new FormData(e.currentTarget).get('url');
              saveLessonVideo(courseId, lesson.id, String(field || ''));
              setNote(`Video saved for ${lesson.title}`);
            }}
          >
            <label className="text-xs font-semibold sm:w-72 shrink-0 self-center">{lesson.title}</label>
            <input
              name="url"
              defaultValue={saved.videos?.[lesson.id] || lesson.videoUrl || ''}
              placeholder="YouTube or mp4 link"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
            <button className="text-xs font-bold px-3 py-2 rounded-full bg-[#FACC15]">Save video</button>
          </form>
        ))}
      </div>
      {note && <p className="text-sm font-semibold">{note}</p>}
    </section>
  );
}
