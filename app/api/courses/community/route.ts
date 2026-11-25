import { NextResponse } from 'next/server';
import { isAdminSession, requireAdminWrite } from '@/lib/admin-guard';
import { courseAccessDenied, inScope, mentorCourseScope } from '@/lib/mentor-scope';
import { currentProfile, staffIdentity } from '@/lib/user-session';
import { getEnrollments } from '@/lib/payments';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';
import {
  addDiscussionNote, courseQuestions, deleteCourseQuestion, deleteDiscussionNote, deleteShortVideo,
  discussionPosts, saveCourseQuestion, saveShortVideo, shortVideos, type AuthorRole,
} from '@/lib/course-community';

export const dynamic = 'force-dynamic';

/** Who is looking at this course: an enrolled student, the course team, or a visitor. */
async function viewerOf(courseId: string) {
  const [profile, staff] = await Promise.all([currentProfile(), staffIdentity()]);
  const enrolled = Boolean(profile?.roles.includes('Student') && (await getEnrollments(profile.id)).includes(courseId));
  const team = Boolean(staff && (staff.admin || inScope(await mentorCourseScope(), courseId)));
  const canManage = Boolean(team && staff && (isAdminSession() || (!staff.admin && staff.level !== 'assistant')));
  let author: { name: string; role: AuthorRole } | null = null;
  // Someone signed in as an enrolled student writes under their own name.
  if (enrolled && profile) author = { name: profile.name, role: 'Student' };
  else if (team && staff) author = staff.admin ? { name: 'Admin', role: 'Admin' } : { name: staff.profile.name, role: 'Mentor' };
  return { member: enrolled || team, team, canManage, author };
}

async function payload(courseId: string) {
  const viewer = await viewerOf(courseId);
  const [questions, shorts, discussions] = await Promise.all([courseQuestions(courseId), shortVideos(courseId), discussionPosts(courseId)]);
  return {
    success: true,
    // Relevant questions are public; videos and the discussion are only for the course members.
    questions,
    shorts: viewer.member ? shorts : [],
    discussions: viewer.member ? discussions : [],
    member: viewer.member,
    canManage: viewer.canManage,
  };
}

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course.' }, { status: 400 });
  return NextResponse.json(await payload(courseId));
}

export async function POST(request: Request) {
  if (rateLimited(request, 'community', 60, 10 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '');
    if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course.' }, { status: 400 });
    const action = String(body.action || '');

    if (action === 'post') {
      const { author } = await viewerOf(courseId);
      if (!author) return NextResponse.json({ success: false, message: 'Enroll in this course to join its discussion.' }, { status: 403 });
      await addDiscussionNote(courseId, author, String(body.text || ''), String(body.postId || ''));
      return NextResponse.json(await payload(courseId));
    }

    // Everything below changes what the course team publishes.
    const denied = await requireAdminWrite('Courses');
    if (denied) return denied;
    const outside = await courseAccessDenied(courseId);
    if (outside) return outside;
    const id = String(body.id || '');
    if (action === 'delete-note') await deleteDiscussionNote(courseId, id);
    else if (action === 'save-question') await saveCourseQuestion(courseId, body);
    else if (action === 'delete-question') await deleteCourseQuestion(courseId, id);
    else if (action === 'save-short') await saveShortVideo(courseId, body);
    else if (action === 'delete-short') await deleteShortVideo(courseId, id);
    else return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
    return NextResponse.json(await payload(courseId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
