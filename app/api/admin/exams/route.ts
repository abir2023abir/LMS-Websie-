import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { attemptsFor, deleteExam, listExams, saveExam } from '@/lib/exams';

export const dynamic = 'force-dynamic';

async function payload() {
  const [exams, attempts] = await Promise.all([listExams(), attemptsFor()]);
  return { success: true, exams, attempts };
}

// Admins and mentors create exams and see every student's result.
export async function GET() {
  const denied = await requireAdmin('Exams');
  if (denied) return denied;
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdmin('Exams');
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') await deleteExam(String(body.id || ''));
    else await saveExam(body);
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the exam.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
