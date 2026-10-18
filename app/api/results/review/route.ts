import { NextResponse } from 'next/server';
import { resultById, reviewResult } from '@/lib/accounts';
import { staffDenied, staffIdentity } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  try {
    const body = await request.json();
    const id = String(body.id || '');
    if (!(await resultById(id))) return NextResponse.json({ success: false, message: 'Result not found.' }, { status: 404 });
    await reviewResult(id, Boolean(body.passed), String(body.review || '').slice(0, 1000), staff.who);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
