import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import {
  assignCourseMentor,
  decideLink,
  linkById,
  listCourseSettings,
  listLinks,
  listProfiles,
  profileByEmail,
  profileById,
  publicProfile,
  updateProfile,
} from '@/lib/accounts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const [profiles, links, courses] = await Promise.all([listProfiles(), listLinks(), listCourseSettings()]);
    return NextResponse.json({
      success: true,
      profiles: profiles.map((item) => ({ ...publicProfile(item), mentor_level: item.mentor_level || 'lead' })),
      links,
      courses,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.linkId) {
      if (body.status !== 'approved' && body.status !== 'rejected') {
        return NextResponse.json({ success: false, message: 'Choose approve or reject.' }, { status: 400 });
      }
      if (!(await linkById(String(body.linkId)))) {
        return NextResponse.json({ success: false, message: 'Link not found.' }, { status: 404 });
      }
      await decideLink(String(body.linkId), body.status, 'admin');
      return NextResponse.json({ success: true });
    }
    if (body.courseId) {
      const mentor = await profileByEmail(String(body.mentorEmail || ''));
      if (!mentor || !mentor.roles.includes('Instructor')) {
        return NextResponse.json({ success: false, message: 'That email is not a mentor account.' }, { status: 400 });
      }
      await assignCourseMentor(String(body.courseId), mentor.email, 'admin');
      return NextResponse.json({ success: true });
    }
    if (body.profileId) {
      const profile = await profileById(String(body.profileId));
      if (!profile) return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
      if (typeof body.disabled === 'boolean') {
        await updateProfile(profile.id, { disabled: body.disabled });
        return NextResponse.json({ success: true });
      }
      if (body.mentorLevel === 'lead' || body.mentorLevel === 'assistant') {
        if (!profile.roles.includes('Instructor')) {
          return NextResponse.json({ success: false, message: 'Only mentor accounts have a level.' }, { status: 400 });
        }
        await updateProfile(profile.id, { mentor_level: body.mentorLevel });
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json({ success: false, message: 'Nothing to change.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
