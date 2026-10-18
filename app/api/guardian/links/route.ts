import { NextResponse } from 'next/server';
import { decideLink, linkById, linksForGuardian, linksForStudent, listProfiles, requestGuardianLink } from '@/lib/accounts';
import { requireRole } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

// Guardians see their own requests; students see requests that name them.
export async function GET() {
  const { profile, denied } = await requireRole();
  if (denied) return denied;
  try {
    const asGuardian = profile.roles.includes('Guardian') ? await linksForGuardian(profile.id) : [];
    const incoming = profile.roles.includes('Student') ? await linksForStudent(profile.email) : [];
    const names = new Map((incoming.length ? await listProfiles() : []).map((item) => [item.id, item.name]));
    return NextResponse.json({
      success: true,
      asGuardian,
      incoming: incoming.map((link) => ({ ...link, guardian_name: names.get(link.guardian_id) || 'Guardian' })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Guardian');
  if (denied) return denied;
  try {
    const { studentEmail } = await request.json();
    const email = String(studentEmail || '').trim();
    if (!email) return NextResponse.json({ success: false, message: 'Enter the student email.' }, { status: 400 });
    if (email.toLowerCase() === profile.email) {
      return NextResponse.json({ success: false, message: 'A guardian cannot link to their own account.' }, { status: 400 });
    }
    const link = await requestGuardianLink(profile.id, email);
    return NextResponse.json({ success: true, link });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  try {
    const { id, status } = await request.json();
    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ success: false, message: 'Choose approve or reject.' }, { status: 400 });
    }
    const link = await linkById(String(id || ''));
    if (!link || link.student_email !== profile.email) {
      return NextResponse.json({ success: false, message: 'This request is not for your account.' }, { status: 403 });
    }
    await decideLink(link.id, status, profile.email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
