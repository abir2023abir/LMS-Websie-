import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { decideLink, linkById, listLinks, listProfiles, profileById, publicProfile, updateProfile } from '@/lib/accounts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const [profiles, links] = await Promise.all([listProfiles(), listLinks()]);
    return NextResponse.json({ success: true, profiles: profiles.map(publicProfile), links });
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
    if (body.profileId && typeof body.disabled === 'boolean') {
      if (!(await profileById(String(body.profileId)))) {
        return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
      }
      await updateProfile(String(body.profileId), { disabled: body.disabled });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Nothing to change.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
