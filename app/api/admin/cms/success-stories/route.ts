import { NextRequest, NextResponse } from 'next/server';
import { getSuccessStories, createSuccessStory, updateSuccessStory, deleteSuccessStory } from '@/lib/cms-db';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';

export async function GET() {
  try {
    const stories = await getSuccessStories();
    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json({ error: 'Failed to fetch success stories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const data = await request.json();
    const id = await createSuccessStory(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating success story:', error);
    return NextResponse.json({ error: 'Failed to create success story' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdminWrite('Landing Page CMS');
    if (denied) return denied;

    const { id, ...data } = await request.json();
    const success = await updateSuccessStory(id, data);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating success story:', error);
    return NextResponse.json({ error: 'Failed to update success story' }, { status: 500 });
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

    const success = await deleteSuccessStory(id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting success story:', error);
    return NextResponse.json({ error: 'Failed to delete success story' }, { status: 500 });
  }
}
