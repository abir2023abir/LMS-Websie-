import { NextResponse } from 'next/server';
import { listAssignments, saveSubmission, submissionsForEmail } from '@/lib/admin-studio';

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email') || '';
  return NextResponse.json({
    success: true,
    assignments: listAssignments(),
    submissions: email ? submissionsForEmail(email) : [],
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const bytes = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : undefined;
    const submission = saveSubmission({
      assignmentId: String(form.get('assignmentId') || ''),
      studentName: String(form.get('studentName') || ''),
      email: String(form.get('email') || ''),
      text: String(form.get('text') || ''),
      fileName: file instanceof File ? file.name : '',
      bytes,
    });
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not submit the assignment.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
