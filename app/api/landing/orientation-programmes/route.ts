import { NextResponse } from 'next/server';
import { localOrientationProgrammes } from '@/lib/orientation-programme-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
  const today = formatDate(new Date());
  let rows = localOrientationProgrammes();
  const hasCmsDatabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (hasCmsDatabase) {
    const { getAllOrientationProgrammes } = await import('@/lib/landing-cms');
    rows = await getAllOrientationProgrammes();
  }
  const programmes = rows
    .filter((programme) => {
      if (!programme.is_active || !programme.event_date) return false;
      const eventDate = new Date(programme.event_date);
      return Number.isFinite(eventDate.getTime()) && formatDate(eventDate) >= today;
    })
    .sort((a, b) => new Date(String(a.event_date)).getTime() - new Date(String(b.event_date)).getTime());

  return NextResponse.json({ success: true, programmes });
}
