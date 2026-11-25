import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/db';
import { getFallbackCourseData } from '@/lib/progress';
import { listCourseEdits } from '@/lib/course-edits';
import { applyCourseEdit } from '@/lib/apply-course-edit';
import { courseSettings } from '@/lib/accounts';
import { staffIdentity } from '@/lib/user-session';
import { listAssignments } from '@/lib/assignments';
import { listQuizzes } from '@/lib/quizzes';
import { listExams } from '@/lib/exams';
import { certificationText, coursePoints } from '@/lib/course-overview';
import { featuredCourses } from '@/lib/data';

export const dynamic = 'force-dynamic';

// What a visitor may see of the classroom before enrolling: titles and counts only.
// Never lesson videos, notes, instructions, questions or answers.
export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  const stored = await getCourseById(courseId).catch(() => null);
  const builtIn = featuredCourses.some((course) => String(course.id) === courseId) ? getFallbackCourseData(courseId) : null;
  const base = stored?.modules?.length ? stored : builtIn ? { ...builtIn, ...(stored || {}), modules: builtIn.modules } : stored;
  const notFound = () => NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
  if (!base) return notFound();
  const settings = await courseSettings(courseId).catch(() => null);
  if (settings && settings.visibility !== 'published' && !(await staffIdentity())) return notFound();

  const edits = await listCourseEdits().catch(() => ({} as Awaited<ReturnType<typeof listCourseEdits>>));
  const course = applyCourseEdit(base, edits[courseId]);
  const [assignments, quizzes, exams] = await Promise.all([listAssignments(), listQuizzes(), listExams()]);
  const mine = <T extends { courseId: string; published: boolean }>(list: T[]) => list.filter((item) => item.courseId === courseId && item.published);

  return NextResponse.json({
    success: true,
    course: {
      id: courseId,
      title: course.title,
      description: course.description,
      category: course.category || '',
      type: course.type || 'Live',
      thumbnail: course.thumbnail,
      instructorName: course.instructorName || '',
      certification: certificationText(course.title, course.certification),
      outcomes: coursePoints({ ...course, id: courseId }, 'outcomes'),
    },
    modules: (course.modules || []).map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: (mod.lessons || []).map((lesson) => ({ id: lesson.id, title: lesson.title, duration: lesson.duration || '' })),
    })),
    assignments: mine(assignments).map((item) => ({ id: item.id, title: item.title, place: [item.moduleTitle, item.lessonTitle].filter(Boolean).join(' · '), maxScore: item.maxScore })),
    quizzes: mine(quizzes).map((item) => ({ id: item.id, title: item.title, place: [item.moduleTitle, item.lessonTitle].filter(Boolean).join(' · '), questions: item.questions.length, passMark: item.passMark, minutes: item.timeLimitMinutes || 0 })),
    exams: mine(exams).map((item) => ({ id: item.id, title: item.title, place: [item.moduleTitle, item.lessonTitle].filter(Boolean).join(' · '), questions: item.questions.length, passMark: item.passMark, minutes: item.durationMinutes })),
  });
}
