import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteEarning, listEarnings, saveEarning } from '@/lib/admin-studio';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, earnings: listEarnings() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      deleteEarning(String(body.id || ''));
      return NextResponse.json({ success: true, earnings: listEarnings() });
    }
    saveEarning({
      id: body.id ? String(body.id) : undefined,
      studentName: String(body.studentName || ''),
      courseTitle: String(body.courseTitle || ''),
      amount: Number(body.amount) || 0,
      method: String(body.method || ''),
      status: String(body.status || ''),
      date: String(body.date || ''),
    });
    return NextResponse.json({ success: true, earnings: listEarnings() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the earning row.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
