import { NextResponse } from 'next/server';
import { getAboutContent } from '@/lib/cms-db';

export async function GET() {
  try {
    const content = await getAboutContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}
