import { NextResponse } from 'next/server';
import { adminOnly } from '@/lib/mentor-scope';
import { listDeskThreads, replyDeskThread } from '@/lib/desk-messages';

// Every message, for the admin only. Instructors use /api/messages, limited to their own courses.
export async function GET() {
  const denied = adminOnly();
  if (denied) return denied;
  return NextResponse.json({ success: true, threads: await listDeskThreads() });
}

export async function POST(request: Request) {
  const denied = adminOnly();
  if (denied) return denied;
  try {
    const body = await request.json();
    const thread = await replyDeskThread(String(body.id || ''), String(body.text || ''));
    return NextResponse.json({ success: true, thread, threads: await listDeskThreads() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send the reply.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
