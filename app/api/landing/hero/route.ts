import { NextResponse } from 'next/server';
import { getHeroContent } from '@/lib/cms-db';

export async function GET() {
  try {
    const content = await getHeroContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json({ error: 'Failed to fetch hero content' }, { status: 500 });
  }
}
