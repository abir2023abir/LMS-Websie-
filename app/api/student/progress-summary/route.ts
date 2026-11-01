import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { courseProgress } from '@/lib/progression';
import { courseRanking } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

// Points for each finished step — they add up to the student's level.
const XP: Record<string, number> = { video: 10, quiz: 20, assignment: 20, exam: 40, live: 30, approval: 10 };
const LEVELS = [
  { name: 'Starter', min: 0 }, { name: 'Learner', min: 100 }, { name: 'Achiever', min: 250 },
  { name: 'Expert', min: 500 }, { name: 'Master', min: 1000 },
];

// The signed-in student's own progress, level and rank. Never lists other students.
export async function GET() {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const courseIds = await getEnrollments(profile.id);
  const courses = await Promise.all(courseIds.map(async (courseId) => {
    const [progress, ranking] = await Promise.all([courseProgress(profile.id, courseId), courseRanking(courseId)]);
    const xp = progress.lessons.reduce((sum, lesson) => sum + lesson.steps.filter((step) => step.state === 'done').reduce((s, step) => s + (XP[step.key] || 0), 0), 0);
    const current = progress.lessons.find((lesson) => lesson.lessonId === progress.currentLessonId);
    const rank = ranking.findIndex((row) => row.studentId === profile.id);
    return {
      courseId,
      courseTitle: progress.courseTitle,
      percent: progress.percent,
      lessonsDone: progress.lessons.filter((lesson) => lesson.state === 'done').length,
      lessonsTotal: progress.lessons.length,
      currentLesson: progress.percent === 100 ? '' : current?.lessonTitle || '',
      nextStep: progress.percent === 100 ? '' : current?.steps.find((step) => step.state === 'current')?.label || '',
      rank: rank >= 0 ? rank + 1 : null,
      rankTotal: ranking.length,
      xp,
    };
  }));
  const xp = courses.reduce((sum, course) => sum + course.xp, 0);
  const levelIndex = LEVELS.reduce((found, level, index) => (xp >= level.min ? index : found), 0);
  const next = LEVELS[levelIndex + 1];
  return NextResponse.json({
    success: true,
    xp,
    level: { number: levelIndex + 1, name: LEVELS[levelIndex].name, nextName: next?.name || null, nextAt: next?.min || null, from: LEVELS[levelIndex].min },
    courses,
  });
}
