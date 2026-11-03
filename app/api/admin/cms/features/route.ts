import { NextRequest, NextResponse } from 'next/server';
import { getFeatures, createFeature, updateFeature, deleteFeature } from '@/lib/cms-db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  try {
    const features = await getFeatures();
    return NextResponse.json({ features });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;

    const data = await request.json();
    const id = await createFeature(data);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;

    const { id, ...data } = await request.json();
    const success = await updateFeature(id, data);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const success = await deleteFeature(id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
  }
}
