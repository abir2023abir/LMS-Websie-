import { NextResponse } from 'next/server';
import { courseSettings, listCourseSettings, saveCourseSettings, type Approval, type Visibility } from '@/lib/accounts';
import { staffDenied, staffIdentity } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

const VISIBILITY: Visibility[] = ['published', 'hidden', 'archived'];
const APPROVAL: Approval[] = ['none', 'pending', 'approved'];

export async function GET() {
  try {
    const staff = await staffIdentity();
    const rows = await listCourseSettings();
    const settings = Object.fromEntries(
      rows.map((row) => [
        row.course_id,
        staff ? row : { course_id: row.course_id, visibility: row.visibility, discount: row.discount },
      ]),
    );
    return NextResponse.json({ success: true, settings, level: staff?.level || null });
  } catch (error: any) {
    return NextResponse.json({ success: false, settings: {}, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    if (!courseId) return NextResponse.json({ success: false, message: 'Pick a course.' }, { status: 400 });

    const current = await courseSettings(courseId);
    const next = { ...current, updated_by: staff.who };
    const lead = staff.level !== 'assistant';

    if (body.approval !== undefined) {
      if (!APPROVAL.includes(body.approval)) return NextResponse.json({ success: false, message: 'Unknown approval state.' }, { status: 400 });
      if (body.approval !== 'pending' && !lead) {
        return NextResponse.json({ success: false, message: 'Assistant mentors can only send a course for approval.' }, { status: 403 });
      }
      next.approval = body.approval;
    }
    if (body.visibility !== undefined) {
      if (!VISIBILITY.includes(body.visibility)) return NextResponse.json({ success: false, message: 'Unknown status.' }, { status: 400 });
      if (!lead) return NextResponse.json({ success: false, message: 'Assistant mentors cannot publish, hide, or archive.' }, { status: 403 });
      if (body.visibility === 'published' && next.approval === 'pending') {
        return NextResponse.json({ success: false, message: 'Approve the course before publishing it.' }, { status: 409 });
      }
      next.visibility = body.visibility;
    }
    if (body.discount !== undefined) {
      if (!lead) return NextResponse.json({ success: false, message: 'Assistant mentors cannot change discounts.' }, { status: 403 });
      const value = Number(body.discount);
      if (!Number.isFinite(value)) return NextResponse.json({ success: false, message: 'Discount must be a number.' }, { status: 400 });
      next.discount = Math.max(0, Math.min(90, Math.round(value)));
    }

    await saveCourseSettings(next);
    return NextResponse.json({ success: true, settings: next });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
