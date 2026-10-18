import { NextResponse } from 'next/server';
import { ROLES, markAttendance, publicProfile, updateProfile, type Role } from '@/lib/accounts';
import { currentProfile } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await currentProfile();
    if (!profile) return NextResponse.json({ success: true, profile: null });
    if (profile.roles.includes('Student')) await markAttendance(profile.id).catch(() => undefined);
    return NextResponse.json({ success: true, profile: publicProfile(profile) });
  } catch (error: any) {
    return NextResponse.json({ success: false, profile: null, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) return NextResponse.json({ success: false, message: 'Please sign in.' }, { status: 401 });
    const body = await request.json();
    const role = body.role as Role;
    if (!ROLES.includes(role)) return NextResponse.json({ success: false, message: 'Pick a role.' }, { status: 400 });

    const roles = body.action === 'add' ? Array.from(new Set([...profile.roles, role])) : profile.roles;
    if (!roles.includes(role)) return NextResponse.json({ success: false, message: 'This account does not have that role.' }, { status: 403 });

    await updateProfile(profile.id, { roles, active_role: role });
    return NextResponse.json({ success: true, profile: publicProfile({ ...profile, roles, active_role: role }) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
