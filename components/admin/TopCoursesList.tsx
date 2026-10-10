'use client';

import Image from 'next/image';
import { Award, Star } from 'lucide-react';

interface TopCourseItem {
  id: string;
  title: string;
  category: string;
  sales: number;
  rating: number;
  price: string;
  thumbnail: string;
}

interface TopCoursesListProps {
  courses?: TopCourseItem[];
}

const defaultTopCourses: TopCourseItem[] = [
  {
    id: '1',
    title: 'General English Foundation Capsule',
    category: 'General English',
    sales: 1420,
    rating: 4.9,
    price: '$39',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=150&fit=crop',
  },
  {
    id: '2',
    title: 'Spoken English & Accent Perfection',
    category: 'Spoken English',
    sales: 1150,
    rating: 4.8,
    price: '$49',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&h=150&fit=crop',
  },
  {
    id: '3',
    title: 'IELTS Band 8+ Masterclass',
    category: 'IELTS Prep',
    sales: 980,
    rating: 4.95,
    price: '$69',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=150&fit=crop',
  },
  {
    id: '4',
    title: 'Business English & Corporate Skills',
    category: 'Business English',
    sales: 840,
    rating: 4.9,
    price: '$59',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=150&fit=crop',
  },
];

export default function TopCoursesList({ courses }: TopCoursesListProps) {
  const topCourses = courses && courses.length > 0 ? courses : defaultTopCourses;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Top Performing English Capsules</span>
        </h3>
        <span className="text-xs font-semibold text-purple-600">
          Live Rankings
        </span>
      </div>

      <div className="space-y-3.5">
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
                    <Star className="w-3 h-3 fill-amber-400" /> {course.rating}
                  </span>
                  <span>•</span>
                  <span>{course.sales} learners</span>
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="font-display font-extrabold text-xs text-slate-900">
                {course.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
