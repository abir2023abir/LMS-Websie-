import { NextRequest, NextResponse } from 'next/server';
import { getHeroContent, saveHeroContent } from '@/lib/cms-db';
import { verifyAdminSession } from '@/lib/auth-server';

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

    if (!verifyAdminSession(adminSession?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const id = await saveHeroContent(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving hero content:', error);
    return NextResponse.json({ error: 'Failed to save hero content' }, { status: 500 });
  }
}
