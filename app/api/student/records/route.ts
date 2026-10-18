import { NextResponse } from 'next/server';
import { resultById, saveProgress, saveResult } from '@/lib/accounts';
import { requireRole } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

function count(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// The signed-in student records their own progress and scores; the id in the body never picks another student.
export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.type === 'progress') {
      const courseId = String(body.courseId || '').trim();
      if (!courseId) return NextResponse.json({ success: false, message: 'Missing course.' }, { status: 400 });
      await saveProgress({
        student_id: profile.id,
        course_id: courseId,
        percent: Math.min(100, Math.round(count(body.percent))),
        completed_lessons: Math.round(count(body.completedLessons)),
        total_lessons: Math.round(count(body.totalLessons)),
      });
      return NextResponse.json({ success: true });
    }
    if (body.type === 'result') {
      const id = String(body.id || '').trim();
      const kind = body.kind === 'quiz' ? 'quiz' : 'exam';
      if (!id) return NextResponse.json({ success: false, message: 'Missing result id.' }, { status: 400 });
      const existing = await resultById(id);
      if (existing && existing.student_id !== profile.id) {
        return NextResponse.json({ success: false, message: 'This result belongs to another student.' }, { status: 403 });
      }
      await saveResult({
        id,
        student_id: profile.id,
        kind,
        label: String(body.label || (kind === 'quiz' ? 'Quiz' : 'Exam')).slice(0, 200),
        score: count(body.score),
        total: count(body.total),
        passed: Boolean(body.passed),
        review: existing?.review || '',
        graded_by: existing?.graded_by || null,
        at: existing?.at || new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Unknown record type.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
