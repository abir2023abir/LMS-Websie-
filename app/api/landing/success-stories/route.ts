import { NextResponse } from 'next/server';
import { getSuccessStories } from '@/lib/cms-db';

export async function GET() {
  try {
    const stories = await getSuccessStories();
    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json({ error: 'Failed to fetch success stories' }, { status: 500 });
  }
}
