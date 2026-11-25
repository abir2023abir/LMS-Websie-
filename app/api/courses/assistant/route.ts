import { NextResponse } from 'next/server';
import { adminOnly } from '@/lib/mentor-scope';
import { profileByEmail } from '@/lib/accounts';
import { assistantFor, saveCourseAssistant } from '@/lib/course-assistants';

export const dynamic = 'force-dynamic';

// Course Settings → Mentor Assistant (admin only).
export async function GET(request: Request) {
  const denied = adminOnly();
  if (denied) return denied;
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  return NextResponse.json({ success: true, email: await assistantFor(courseId) });
}

export async function PUT(request: Request) {
  const denied = adminOnly();
  if (denied) return denied;
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '');
    const email = String(body.email || '').trim().toLowerCase();
    if (!courseId) return NextResponse.json({ success: false, message: 'Choose a course.' }, { status: 400 });
    if (email) {
      const profile = await profileByEmail(email);
      if (!profile || !profile.roles.includes('Instructor') || profile.mentor_level !== 'assistant') {
        return NextResponse.json({ success: false, message: 'Choose an account with the assistant mentor level.' }, { status: 400 });
      }
    }
    await saveCourseAssistant(courseId, email);
    return NextResponse.json({ success: true, email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the mentor assistant.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
