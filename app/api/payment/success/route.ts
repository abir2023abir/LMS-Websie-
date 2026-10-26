import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function unavailable() {
  return NextResponse.json(
    { success: false, message: 'Payment confirmation is disabled until a verified payment gateway is configured.' },
    { status: 410 },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
