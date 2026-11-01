import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { listAssignments, listSubmissions, saveSubmissionFile, submitAssignment } from '@/lib/assignments';

export const dynamic = 'force-dynamic';

// GET ?courseId&lessonId → one lesson's assignments; no params → all from the student's
// enrolled courses. Each includes the student's own submission and feedback.
export async function GET(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  const lessonId = url.searchParams.get('lessonId') || '';
  const enrolled = await getEnrollments(profile.id);
  if (courseId && !enrolled.includes(courseId)) {
    return NextResponse.json({ success: false, message: 'Enroll in this course to see its assignments.' }, { status: 403 });
  }
  const [assignments, submissions] = await Promise.all([listAssignments(), listSubmissions()]);
  const visible = assignments.filter((item) => item.published
    && (courseId ? item.courseId === courseId : enrolled.includes(item.courseId))
    && (!lessonId || item.lessonId === lessonId));
  return NextResponse.json({
    success: true,
    assignments: visible.map((item) => {
      const mine = submissions.find((submission) => submission.assignmentId === item.id && submission.studentId === profile.id);
      return {
        ...item,
        submission: mine ? { id: mine.id, text: mine.text, fileName: mine.fileName, status: mine.status, score: mine.score, feedback: mine.feedback, late: mine.late, submittedAt: mine.submittedAt } : null,
      };
    }),
  });
}

export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const form = await request.formData();
    const assignment = (await listAssignments()).find((item) => item.id === String(form.get('assignmentId') || '') && item.published);
    if (!assignment) return NextResponse.json({ success: false, message: 'Assignment not found.' }, { status: 404 });
    if (!(await getEnrollments(profile.id)).includes(assignment.courseId)) {
      return NextResponse.json({ success: false, message: 'Enroll in this course to submit.' }, { status: 403 });
    }
    const file = form.get('file');
    let fileId = '';
    let fileName = '';
    if (file instanceof File && file.size > 0) {
      if (!assignment.allowFile) return NextResponse.json({ success: false, message: 'This assignment takes a written answer only.' }, { status: 400 });
      fileId = await saveSubmissionFile(file);
      fileName = file.name;
    }
    const submission = await submitAssignment(assignment, { id: profile.id, name: profile.name || profile.email, email: profile.email }, { text: String(form.get('text') || ''), fileId, fileName });
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not submit.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
