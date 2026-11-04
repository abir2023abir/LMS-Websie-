import { NextRequest, NextResponse } from 'next/server';
import { getAboutContent, saveAboutContent } from '@/lib/cms-db';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';

export async function GET() {
  try {
    const content = await getAboutContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const data = await request.json();
    const id = await saveAboutContent(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving about content:', error);
    return NextResponse.json({ error: 'Failed to save about content' }, { status: 500 });
  }
}
