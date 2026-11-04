import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import {
  assignCourseMentor, unassignCourseMentor,
  createProfile,
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

import { listPhotoOwners } from '@/lib/teacher-photos';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin('Accounts');
  if (denied) return denied;
  try {
    const [profiles, links, courses, photos] = await Promise.all([listProfiles(), listLinks(), listCourseSettings(), listPhotoOwners()]);
    return NextResponse.json({
      success: true,
      profiles: profiles.map((item) => ({ ...publicProfile(item), mentor_level: item.mentor_level || 'lead', has_photo: photos.has(item.id) })),
      links,
      courses,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/** Admin creates a mentor (instructor) account without signing the admin in as that person. */
export async function POST(request: Request) {
  const denied = await requireAdmin('Accounts');
  if (denied) return denied;
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const password = String(body.password || '');
    const level = body.mentorLevel === 'assistant' ? 'assistant' : 'lead';
    if (!name) return NextResponse.json({ success: false, message: 'Enter the instructor name.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (await profileByEmail(email)) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 409 });
    }
    const profile = await createProfile({ email, name, password, role: 'Instructor' });
    if (level === 'assistant') await updateProfile(profile.id, { mentor_level: 'assistant' });
    return NextResponse.json({ success: true, profile: publicProfile(profile) });
  } catch (error: any) {
    const duplicate = error.message === 'duplicate';
    return NextResponse.json(
      { success: false, message: duplicate ? 'An account with this email already exists.' : error.message || 'Could not create the account.' },
      { status: duplicate ? 409 : 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin('Accounts');
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
    if (body.courseId && body.action === 'unassign') {
      await unassignCourseMentor(String(body.courseId), 'admin');
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
