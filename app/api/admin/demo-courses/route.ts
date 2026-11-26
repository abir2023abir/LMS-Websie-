import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/admin-guard';
import { installDemoCourses, installedDemoCourses, removeDemoCourses } from '@/lib/demo-courses';

export const dynamic = 'force-dynamic';
// Adding the demo courses saves many records one after another.
export const maxDuration = 60;

const unauthorized = () => NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

async function answer(work: () => Promise<unknown>) {
  if (!isAdminSession()) return unauthorized();
  try {
    await work();
    return NextResponse.json({ success: true, installed: await installedDemoCourses() });
  } catch (error: any) {
    console.error('API /api/admin/demo-courses Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Could not update the demo courses.' }, { status: 500 });
  }
}

/** Admin only: how many demo courses are on the site. */
export async function GET() {
  return answer(async () => undefined);
}

/** Admin only: add (or refresh) the demo courses. */
export async function POST() {
  return answer(() => installDemoCourses());
}

/** Admin only: remove the demo courses and everything attached to them. */
export async function DELETE() {
  return answer(removeDemoCourses);
}
