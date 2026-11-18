import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getR2Config, saveR2Config } from '@/lib/r2';

export const dynamic = 'force-dynamic';

// Admin only: the video storage (Cloudflare R2) connection. The secret is never sent back.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const found = await getR2Config();
  return NextResponse.json({
    success: true,
    configured: Boolean(found),
    source: found?.source || '',
    accountId: found?.config.accountId || '',
    bucket: found?.config.bucket || '',
    accessKeyId: found ? `${found.config.accessKeyId.slice(0, 4)}…${found.config.accessKeyId.slice(-4)}` : '',
  });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const current = await getR2Config();
    if (current?.source === 'env') {
      return NextResponse.json({ success: false, message: 'Video storage is already set in the hosting settings (R2_* variables).' }, { status: 409 });
    }
    const saved = await saveR2Config({
      accountId: String(body.accountId || ''),
      accessKeyId: String(body.accessKeyId || ''),
      secretAccessKey: String(body.secretAccessKey || ''),
      bucket: String(body.bucket || ''),
    });
    return NextResponse.json({ success: true, bucket: saved.bucket });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not connect.' }, { status: 400 });
  }
}
