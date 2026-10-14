import { NextResponse } from 'next/server';
import { getOffer } from '@/lib/service-catalog';
import { createServiceRequest } from '@/lib/service-requests';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = String(body.planId || '');
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();

    if (!getOffer(planId)) {
      return NextResponse.json({ success: false, message: 'Pick a service first.' }, { status: 400 });
    }
    if (!name || !phone || !email || !message) {
      return NextResponse.json({ success: false, message: 'Name, phone, email, and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Enter a valid email.' }, { status: 400 });
    }

    const saved = await createServiceRequest({ planId, name, phone, email, message });
    return NextResponse.json({ success: true, request: saved });
  } catch (error) {
    console.error('[Service request]', error);
    return NextResponse.json({ success: false, message: 'Could not save the request.' }, { status: 500 });
  }
}
