import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteAssignment, listAssignments, listSubmissions, readSubmissionFile, reviewSubmission, saveAssignment, type SubmissionStatus } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

const STATUSES = new Set<SubmissionStatus>(['submitted', 'needs-changes', 'graded']);

async function payload() {
  const [assignments, submissions] = await Promise.all([listAssignments(), listSubmissions()]);
  return { success: true, assignments, submissions };
}

// Admins and mentors manage lesson assignments and review submissions.
export async function GET(request: Request) {
  const denied = await requireAdmin('Assignments');
  if (denied) return denied;
  const fileId = new URL(request.url).searchParams.get('file') || '';
  if (fileId) {
    const file = await readSubmissionFile(fileId);
    if (!file) return NextResponse.json({ success: false, message: 'File not found.' }, { status: 404 });
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: { 'Content-Type': file.type, 'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"` },
    });
  }
  return NextResponse.json(await payload());
}

export async function POST(request: Request) {
  const denied = await requireAdmin('Assignments');
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      await deleteAssignment(String(body.id || ''));
    } else if (body.action === 'review') {
      const submission = (await listSubmissions()).find((item) => item.id === body.id);
      const assignment = (await listAssignments()).find((item) => item.id === submission?.assignmentId);
      const status = STATUSES.has(body.status) ? (body.status as SubmissionStatus) : 'graded';
      await reviewSubmission(String(body.id || ''), { status, score: body.score === '' || body.score === null || body.score === undefined ? null : Number(body.score), feedback: String(body.feedback || '') }, assignment?.maxScore || 100);
    } else {
      await saveAssignment(body);
    }
    return NextResponse.json(await payload());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
