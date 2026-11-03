import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getContactBookingContent, saveContactBookingContent } from '@/lib/contact-booking-content';

export const dynamic = 'force-dynamic';
const isAdmin = async () => (await requireAdmin('Landing Page CMS')) === null;

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ content: getContactBookingContent() });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { return NextResponse.json({ success: true, content: saveContactBookingContent(await request.json()) }); }
  catch (error) { console.error('Error saving contact booking content:', error); return NextResponse.json({ error: 'Failed to save contact booking content' }, { status: 500 }); }
}
