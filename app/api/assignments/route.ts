import { NextResponse } from 'next/server';
import { listAssignments, saveSubmission, submissionsForEmail } from '@/lib/admin-studio';
import { currentProfile } from '@/lib/user-session';

export async function GET() {
  const profile = await currentProfile();
  return NextResponse.json({
    success: true,
    assignments: listAssignments(),
    submissions: profile ? submissionsForEmail(profile.email) : [],
  });
}

export async function POST(request: Request) {
  const profile = await currentProfile();
  if (!profile || !profile.roles.includes('Student')) {
    return NextResponse.json({ success: false, message: 'Sign in as a student to submit.' }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const file = form.get('file');
    const bytes = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : undefined;
    const submission = saveSubmission({
      assignmentId: String(form.get('assignmentId') || ''),
      studentName: profile.name,
      email: profile.email,
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
