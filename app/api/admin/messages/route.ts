import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { listDeskThreads, replyDeskThread } from '@/lib/desk-messages';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, threads: listDeskThreads() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const thread = replyDeskThread(String(body.id || ''), String(body.text || ''));
    return NextResponse.json({ success: true, thread, threads: listDeskThreads() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send the reply.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
