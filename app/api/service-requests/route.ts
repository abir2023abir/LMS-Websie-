import { NextResponse } from 'next/server';
import { getOffer } from '@/lib/service-catalog';
import { createServiceRequest, getServiceRequest, replyToServiceRequest } from '@/lib/service-requests';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  if (!id || !email) return NextResponse.json({ success: false, message: 'Request id and email are required.' }, { status: 400 });
  const found = await getServiceRequest(id);
  if (!found || found.email.toLowerCase() !== email) {
    return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, request: found });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = String(body.planId || '');
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();
    const billing = body.billing === 'year' ? 'year' : body.billing === 'once' ? 'once' : 'month';

    if (!getOffer(planId)) {
      return NextResponse.json({ success: false, message: 'Pick a service first.' }, { status: 400 });
    }
    if (!name || !phone || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, phone, email, and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Enter a valid email.' }, { status: 400 });
    }

    const saved = await createServiceRequest({ planId, billing, name, phone, email, message });
    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    console.error('[Service request]', error);
    return NextResponse.json({ success: false, message: 'Could not save the request.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await replyToServiceRequest(String(body.id || ''), 'customer', String(body.text || ''), String(body.email || ''));
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send the reply.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
