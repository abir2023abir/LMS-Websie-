import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, BookOpen, Users, Award, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { Course } from '@/lib/data';

interface CourseCardProps {
  course: Course;
  index?: number;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        ))}
        {half === 1 && (
          <Star key="h" className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50" />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
        ))}
      </div>
      <span className="text-amber-400 font-semibold text-xs">{rating.toFixed(1)}</span>
      <span className="text-slate-500 text-xs">({count.toLocaleString()})</span>
    </div>
  );
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const isOnSale   = course.originalPrice > course.price;
  const discount   = isOnSale
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-dark-700 rounded-2xl overflow-hidden',
        'border border-white/8 hover:border-primary-500/40',
        'transition-all duration-300 ease-out',
        'hover:shadow-2xl hover:shadow-primary-600/15 hover:-translate-y-1',
        'card-shimmer',
        'animate-fade-up opacity-0'
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* ── Thumbnail ── */}
      <div className="relative aspect-[16/9] overflow-hidden bg-dark-600">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {course.isBestseller && (
            <span className="flex items-center gap-1 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-1 rounded-lg">
              <Flame className="w-3 h-3" /> Bestseller
            </span>
          )}
          {course.isNew && (
            <span className="flex items-center gap-1 bg-accent-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              <Sparkles className="w-3 h-3" /> New
            </span>
          )}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category */}
        <span
          className={cn(
            'badge w-fit',
            course.categoryColor
          )}
        >
          {course.category}
        </span>

        {/* Title */}
        <h3 className="font-display font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors duration-200">
          <Link href={`/courses/${course.slug}`} className="focus-ring rounded-md">
            <span className="absolute inset-0" aria-hidden="true" />
            {course.title}
          </Link>
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <Image
            src={course.instructor.avatar}
            alt={course.instructor.name}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full border border-white/15 flex-shrink-0"
          />
          <span className="text-xs text-slate-400 truncate">
            {course.instructor.name}
          </span>
          <span className="text-slate-600 text-xs">·</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
            course.level === 'Beginner'     && 'bg-emerald-500/15 text-emerald-400',
            course.level === 'Intermediate' && 'bg-amber-500/15   text-amber-400',
            course.level === 'Advanced'     && 'bg-rose-500/15    text-rose-400',
          )}>
            {course.level}
          </span>
        </div>

        {/* Rating */}
        <StarRating rating={course.rating} count={course.reviewCount} />

        {/* Meta: duration, lessons, students */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {(course.studentCount / 1000).toFixed(0)}K
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 mt-auto" />

        {/* Price Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl text-white">
              {formatPrice(course.price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-slate-500 line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 hover:border-primary-500/40 px-3 py-1.5 rounded-xl transition-all duration-150"
            aria-label={`Enroll in ${course.title}`}
          >
            <Award className="w-3.5 h-3.5" />
            Enroll
          </button>
        </div>
      </div>
    </article>
  );
}
