import { NextRequest, NextResponse } from 'next/server';
import { getContactEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/lib/cms-db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  try {
    // Enquiries contain names, emails and phone numbers: admin only.
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;
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

    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;

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

    const denied = await requireAdmin('Landing Page CMS');
    if (denied) return denied;

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
