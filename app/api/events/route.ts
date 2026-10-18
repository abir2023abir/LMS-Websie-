import { NextResponse } from 'next/server';
import { addCalendarEvent, type CalendarEvent } from '@/lib/accounts';
import { staffDenied, staffIdentity } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

const KINDS: CalendarEvent['kind'][] = ['class', 'exam', 'meeting', 'deadline'];

export async function POST(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const date = String(body.date || '').slice(0, 10);
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !KINDS.includes(body.kind)) {
      return NextResponse.json({ success: false, message: 'Title, kind, and date are required.' }, { status: 400 });
    }
    const meet = String(body.meet || '').trim();
    if (meet && !/^https:\/\//.test(meet)) {
      return NextResponse.json({ success: false, message: 'Meeting link must start with https://' }, { status: 400 });
    }
    await addCalendarEvent({
      id: String(body.id || crypto.randomUUID()),
      title: title.slice(0, 200),
      kind: body.kind,
      date,
      meet,
      created_by: staff.who,
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
