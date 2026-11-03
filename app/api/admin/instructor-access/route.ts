import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { listInstructorAccess, saveInstructorTabs } from '@/lib/instructor-access';
import { profileByEmail } from '@/lib/accounts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, access: await listInstructorAccess() });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const profile = email ? await profileByEmail(email) : null;
  if (!profile || !profile.roles.includes('Instructor')) {
    return NextResponse.json({ success: false, message: 'Pick an instructor account.' }, { status: 400 });
  }
  const tabs = await saveInstructorTabs(email, body.tabs);
  return NextResponse.json({ success: true, email, tabs });
}
