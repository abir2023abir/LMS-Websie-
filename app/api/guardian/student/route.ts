import { NextResponse } from 'next/server';
import { approvedStudentFor, attendanceFor, progressFor, resultsFor, upcomingExams } from '@/lib/accounts';
import { requireRole } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { profile, denied } = await requireRole('Guardian');
  if (denied) return denied;
  try {
    const student = await approvedStudentFor(profile.id);
    if (!student) {
      return NextResponse.json({ success: false, message: 'No approved student link yet.' }, { status: 403 });
    }
    const [attendance, progress, results, exams] = await Promise.all([
      attendanceFor(student.id),
      progressFor(student.id),
      resultsFor(student.id),
      upcomingExams(),
    ]);
    return NextResponse.json({
      success: true,
      student: { id: student.id, name: student.name, email: student.email },
      attendance,
      progress,
      results,
      exams,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
