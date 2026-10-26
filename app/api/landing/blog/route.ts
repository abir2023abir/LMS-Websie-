import { NextResponse } from 'next/server';
import { getBlogArticles } from '@/lib/cms-db';

export async function GET() {
  try {
    const articles = await getBlogArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    return NextResponse.json({ error: 'Failed to fetch blog articles' }, { status: 500 });
  }
}
