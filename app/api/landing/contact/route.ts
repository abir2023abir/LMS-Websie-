import { NextRequest, NextResponse } from 'next/server';
import { createContactEnquiry } from '@/lib/cms-db';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  if (rateLimited(request, 'contact', 5, 10 * 60 * 1000)) return NextResponse.json({ error: TOO_MANY.message }, { status: 429 });
  try {
    const data = await request.json();
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = await createContactEnquiry({
      name,
      email,
      message,
      status: 'pending',
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating contact enquiry:', error);
    return NextResponse.json({ error: 'Failed to create contact enquiry' }, { status: 500 });
  }
}
