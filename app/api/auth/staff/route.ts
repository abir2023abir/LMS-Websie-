import { NextResponse } from 'next/server';
import { staffIdentity } from '@/lib/user-session';

/** Whether the browser has admin_session or a signed-in mentor account. */
export async function GET() {
  const staff = await staffIdentity();
  if (!staff) {
    return NextResponse.json({ success: true, staff: false, admin: false, mentor: false });
  }
  if (staff.admin) {
    return NextResponse.json({ success: true, staff: true, admin: true, mentor: false, who: staff.who });
  }
  return NextResponse.json({
    success: true,
    staff: true,
    admin: false,
    mentor: true,
    who: staff.who,
    mentorLevel: staff.level,
  });
}
