import { NextRequest, NextResponse } from 'next/server';
import { getContactEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/lib/cms-db';
import { verifyAdminSession } from '@/lib/auth-server';

export async function GET() {
  try {
    const enquiries = await getContactEnquiries();
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Error fetching contact enquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch contact enquiries' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    if (!verifyAdminSession(adminSession?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();
    const success = await updateEnquiryStatus(id, status);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return NextResponse.json({ error: 'Failed to update enquiry status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const adminSession = cookieStore.get('admin_session');

    if (!verifyAdminSession(adminSession?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const success = await deleteEnquiry(id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
