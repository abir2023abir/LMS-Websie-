import { NextRequest, NextResponse } from 'next/server';
import { getBlogArticles, createBlogArticle, updateBlogArticle, deleteBlogArticle } from '@/lib/cms-db';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';

export async function GET() {
  try {
    const articles = await getBlogArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    return NextResponse.json({ error: 'Failed to fetch blog articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const data = await request.json();
    const id = await createBlogArticle(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating blog article:', error);
    return NextResponse.json({ error: 'Failed to create blog article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const { id, ...data } = await request.json();
    const success = await updateBlogArticle(id, data);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating blog article:', error);
    return NextResponse.json({ error: 'Failed to update blog article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const success = await deleteBlogArticle(id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting blog article:', error);
    return NextResponse.json({ error: 'Failed to delete blog article' }, { status: 500 });
  }
}
