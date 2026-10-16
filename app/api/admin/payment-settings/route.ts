import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { readPaymentConfig, writePaymentConfig } from '@/lib/payment-config';

function authorized() {
  const token = cookies().get('admin_session')?.value;
  return verifyAdminSession(token);
}

export async function GET() {
  if (!authorized()) return NextResponse.json({ success: false }, { status: 401 });
  const config = readPaymentConfig();
  return NextResponse.json({
    success: true,
    storeId: config.storeId,
    hasPassword: Boolean(config.storePassword),
    live: config.live,
  });
}

export async function POST(request: Request) {
  if (!authorized()) return NextResponse.json({ success: false }, { status: 401 });
  const body = await request.json();
  const current = readPaymentConfig();
  writePaymentConfig({
    storeId: String(body.storeId || '').trim(),
    storePassword: String(body.storePassword || '').trim() || current.storePassword,
    live: Boolean(body.live),
  });
  return NextResponse.json({ success: true });
}
