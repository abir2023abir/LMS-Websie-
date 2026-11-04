import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { deleteServiceRequest, listServiceRequests, replyToServiceRequest, updateServiceRequest, type RequestStatus } from '@/lib/service-requests';

async function authorized() {
  return (await requireAdmin('Requests')) === null;
}

export async function GET() {
  if (!(await authorized())) {
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

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body.id || '');
    // Replying to a customer is open to anyone with this tool; editing or deleting a request is not for assistants.
    if (body.action !== 'reply') {
      const blocked = await requireAdminWrite('Requests');
      if (blocked) return blocked;
    }
    if (body.action === 'delete') {
      await deleteServiceRequest(id);
      return NextResponse.json({ success: true, requests: await listServiceRequests() });
    }
    if (body.action === 'reply') {
      const updated = await replyToServiceRequest(id, 'admin', String(body.text || ''));
      return NextResponse.json({ success: true, request: updated, requests: await listServiceRequests() });
    }
    const status = body.status === 'progress' || body.status === 'done' || body.status === 'new' ? body.status as RequestStatus : undefined;
    const updated = await updateServiceRequest(id, {
      name: body.name !== undefined ? String(body.name) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      email: body.email !== undefined ? String(body.email) : undefined,
      message: body.message !== undefined ? String(body.message) : undefined,
      status,
    });
    return NextResponse.json({ success: true, request: updated, requests: await listServiceRequests() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update the request.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
