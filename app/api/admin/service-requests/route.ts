import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { listServiceRequests } from '@/lib/service-requests';

export async function GET() {
  const session = verifyAdminSession(cookies().get('admin_session')?.value);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requests = await listServiceRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('[Admin service requests]', error);
    return NextResponse.json({ success: false, message: 'Could not load requests.' }, { status: 500 });
  }
}
