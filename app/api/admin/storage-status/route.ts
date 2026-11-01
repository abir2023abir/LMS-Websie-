import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { kvHealth } from '@/lib/kv-store';

export const dynamic = 'force-dynamic';

// Tells the admin panel whether data can be saved (Supabase app_kv table present).
export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, ...(await kvHealth()) });
}
