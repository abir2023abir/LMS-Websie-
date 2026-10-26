import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { getContactBookingContent, saveContactBookingContent } from '@/lib/contact-booking-content';

export const dynamic = 'force-dynamic';
const isAdmin = () => verifyAdminSession(cookies().get('admin_session')?.value);

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ content: getContactBookingContent() });
}

export async function POST(request: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { return NextResponse.json({ success: true, content: saveContactBookingContent(await request.json()) }); }
  catch (error) { console.error('Error saving contact booking content:', error); return NextResponse.json({ error: 'Failed to save contact booking content' }, { status: 500 }); }
}
