import { NextResponse } from 'next/server';
import fs from 'fs';
import { requireAdmin } from '@/lib/admin-guard';
import {
  assignmentFilePath,
  deleteAssignment,
  listAssignments,
  listSubmissions,
  reviewSubmission,
  saveAssignment,
  type SubmissionStatus,
} from '@/lib/admin-studio';

export async function GET(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  const file = new URL(request.url).searchParams.get('file') || '';
  if (file) {
    const target = assignmentFilePath(file);
    if (!fs.existsSync(target)) return NextResponse.json({ success: false }, { status: 404 });
    const bytes = fs.readFileSync(target);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `inline; filename="${file}"` },
    });
  }
  return NextResponse.json({ success: true, assignments: listAssignments(), submissions: listSubmissions() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      deleteAssignment(String(body.id || ''));
      return NextResponse.json({ success: true, assignments: listAssignments(), submissions: listSubmissions() });
    }
    if (body.action === 'review') {
      reviewSubmission(String(body.id || ''), {
        status: String(body.status || 'reviewed') as SubmissionStatus,
        grade: String(body.grade || ''),
        review: String(body.review || ''),
      });
      return NextResponse.json({ success: true, assignments: listAssignments(), submissions: listSubmissions() });
    }
    saveAssignment({
      id: body.id ? String(body.id) : undefined,
      title: String(body.title || ''),
      course: String(body.course || ''),
      instructions: String(body.instructions || ''),
      dueDate: String(body.dueDate || ''),
    });
    return NextResponse.json({ success: true, assignments: listAssignments(), submissions: listSubmissions() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the assignment.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
