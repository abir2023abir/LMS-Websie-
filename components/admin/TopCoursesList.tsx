'use client';

import Image from 'next/image';
import { Award, Star } from 'lucide-react';
import { takaFromUsd } from '@/lib/utils';

interface TopCourseItem {
  id: string;
  title: string;
  category: string;
  sales: number;
  rating: number;
  price: number | string;
  thumbnail: string;
}

interface TopCoursesListProps {
  courses?: TopCourseItem[];
}

export default function TopCoursesList({ courses }: TopCoursesListProps) {
  const topCourses = courses || [];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Top Performing Courses</span>
        </h3>
        <span className="text-xs font-semibold text-purple-600">
          Live Rankings
        </span>
      </div>

      {topCourses.length === 0 ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No enrollment data yet.</div> : <div className="space-y-3.5">
        {topCourses.map((course, idx) => (
          <div
            key={course.id}
            className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-extrabold text-slate-400 w-4 text-center">
                #{idx + 1}
              </span>
              <div className="relative w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-800 truncate leading-snug">
                  {course.title}
                </h4>
                <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="text-amber-500 flex items-center gap-0.5 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" /> {course.rating || '—'}
                  </span>
                  <span>•</span>
                  <span>{course.sales} learners</span>
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="font-display font-extrabold text-xs text-slate-900">{typeof course.price === 'number' ? takaFromUsd(course.price) : course.price}</span>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
