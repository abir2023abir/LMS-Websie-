import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { getBookkeepingPageContent, saveBookkeepingPageContent } from '@/lib/bookkeeping-content';

export const dynamic = 'force-dynamic';

function isAdmin() {
  return verifyAdminSession(cookies().get('admin_session')?.value);
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ content: getBookkeepingPageContent() });
}

export async function POST(request: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const content = saveBookkeepingPageContent(await request.json());
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error saving Bookkeeping page content:', error);
    return NextResponse.json({ error: 'Failed to save Bookkeeping page content' }, { status: 500 });
  }
}
