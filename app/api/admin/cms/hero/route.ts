import { NextRequest, NextResponse } from 'next/server';
import { getHeroContent, saveHeroContent } from '@/lib/cms-db';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';

export async function GET() {
  try {
    const content = await getHeroContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json({ error: 'Failed to fetch hero content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const data = await request.json();
    const id = await saveHeroContent(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving hero content:', error);
    return NextResponse.json({ error: 'Failed to save hero content' }, { status: 500 });
  }
}
