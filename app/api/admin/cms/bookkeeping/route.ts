import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { getBookkeepingPageContent, saveBookkeepingPageContent } from '@/lib/bookkeeping-content';

export const dynamic = 'force-dynamic';

async function isAdmin() {
  return (await requireAdmin('Landing Page CMS')) === null;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ content: getBookkeepingPageContent() });
}

export async function POST(request: NextRequest) {
  const blocked = await requireAdminWrite('Landing Page CMS');
  if (blocked) return blocked;
  try {
    const content = saveBookkeepingPageContent(await request.json());
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Error saving Bookkeeping page content:', error);
    return NextResponse.json({ error: 'Failed to save Bookkeeping page content' }, { status: 500 });
  }
}
