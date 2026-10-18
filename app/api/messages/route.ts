import { NextResponse } from 'next/server';
import { continueDeskThread, getDeskThread, listDeskThreads, openDeskThread, replyDeskThread, type DeskKind } from '@/lib/desk-messages';
import { staffDenied, staffIdentity } from '@/lib/user-session';

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('board') === '1') {
    if (!(await staffIdentity())) return staffDenied();
    return NextResponse.json({ success: true, threads: listDeskThreads() });
  }
  const id = url.searchParams.get('id') || '';
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  const thread = getDeskThread(id);
  if (!thread || thread.email.toLowerCase() !== email) {
    return NextResponse.json({ success: false, message: 'Message not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, thread });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'reply') {
      if (!(await staffIdentity())) return staffDenied();
      const thread = replyDeskThread(String(body.id || ''), String(body.text || ''));
      return NextResponse.json({ success: true, thread, threads: listDeskThreads() });
    }
    if (body.id) {
      const thread = continueDeskThread(String(body.id), String(body.email || ''), String(body.text || ''));
      return NextResponse.json({ success: true, thread });
    }
    const kind: DeskKind = body.kind === 'service' ? 'service' : 'student';
    const thread = openDeskThread({
      kind,
      name: String(body.name || ''),
      email: String(body.email || ''),
      text: String(body.text || ''),
      courseId: String(body.courseId || ''),
      courseTitle: String(body.courseTitle || ''),
      rank: Number(body.rank) || 0,
      rankTotal: Number(body.rankTotal) || 0,
      progress: Number(body.progress) || 0,
    });
    return NextResponse.json({ success: true, thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the message.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
