import { listProfiles } from '@/lib/accounts';
import { allEnrollments } from '@/lib/payments';
import { courseProgress } from '@/lib/progression';
import { listAttempts } from '@/lib/quizzes';
import { attemptsFor } from '@/lib/exams';

export type RankingRow = {
  studentId: string; name: string; email: string;
  percent: number; lessonsDone: number; lessonsTotal: number; currentLesson: string;
  quizAverage: number | null; examAverage: number | null; score: number;
};

/** Everyone enrolled in a course, ordered by progress, then exam and quiz results. */
export async function courseRanking(courseId: string): Promise<RankingRow[]> {
  const [enrollments, profiles] = await Promise.all([allEnrollments(), listProfiles()]);
  const studentIds = Object.entries(enrollments).filter(([, courses]) => courses.includes(courseId)).map(([id]) => id);
  const rows = await Promise.all(studentIds.map(async (studentId) => {
    const profile = profiles.find((item) => item.id === studentId);
    const [progress, quizzes, exams] = await Promise.all([courseProgress(studentId, courseId), listAttempts(studentId), attemptsFor(studentId)]);
    const courseQuizzes = quizzes.filter((attempt) => attempt.courseId === courseId);
    const courseExams = exams.filter((attempt) => attempt.courseId === courseId && attempt.status === 'submitted');
    const average = (list: { percent: number }[]) => (list.length ? Math.round(list.reduce((sum, item) => sum + item.percent, 0) / list.length) : null);
    const quizAverage = average(courseQuizzes);
    const examAverage = average(courseExams);
    return {
      studentId, name: profile?.name || 'Unknown', email: profile?.email || '',
      percent: progress.percent,
      lessonsDone: progress.lessons.filter((lesson) => lesson.state === 'done').length,
      lessonsTotal: progress.lessons.length,
      currentLesson: progress.lessons.find((lesson) => lesson.lessonId === progress.currentLessonId)?.lessonTitle || '',
      quizAverage, examAverage,
      // Progress counts most; results break ties.
      score: progress.percent * 100 + (examAverage ?? 0) * 2 + (quizAverage ?? 0),
    };
  }));
  return rows.filter((row) => row.email).sort((a, b) => b.score - a.score);
}
