import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The gateway credentials/verification flow are not configured. Never return a
// success URL that would make an unverified request look like a paid order.
export async function POST() {
  return NextResponse.json(
    { success: false, mode: 'unavailable', message: 'Live payment processing is not configured. Use the clearly marked demo checkout to test enrollment.' },
    { status: 503 },
  );
}
