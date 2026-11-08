import { NextResponse } from 'next/server';
import { staffDenied, staffIdentity } from '@/lib/user-session';
import { staffCourses } from '@/lib/analytics';
import { performAction, RISK_ACTIONS, riskAlerts, riskThreshold, setRiskThreshold, type RiskActionKind } from '@/lib/assessment-risk';

export const dynamic = 'force-dynamic';

async function payload(allowed: Set<string> | null) {
  return { success: true, threshold: await riskThreshold(), actions: RISK_ACTIONS, alerts: await riskAlerts(allowed) };
}

// Students who failed a quiz or exam too many times (admins: all courses; mentors: only the courses they teach or mentor).
export async function GET() {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  return NextResponse.json(await payload(await staffCourses(staff)));
}

export async function POST(request: Request) {
  const staff = await staffIdentity();
  if (!staff) return staffDenied();
  if (!staff.admin && staff.level === 'assistant') {
    return NextResponse.json({ success: false, message: 'Assistant mentors can view risk alerts but cannot take action.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const allowed = await staffCourses(staff);
    if (body.action === 'threshold') {
      if (!staff.admin) return NextResponse.json({ success: false, message: 'Only the admin can change the alert threshold.' }, { status: 403 });
      await setRiskThreshold(Number(body.threshold));
    } else if (body.action === 'act') {
      await performAction({
        alertKey: String(body.alertKey || ''), action: String(body.type || '') as RiskActionKind, note: String(body.note || ''), extra: Number(body.extra) || 0,
        by: { id: staff.admin ? 'admin' : staff.profile.id, name: staff.admin ? 'Admin' : staff.profile.name || staff.who },
      }, allowed);
    } else {
      throw new Error('Unknown action.');
    }
    return NextResponse.json(await payload(allowed));
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Could not save.' }, { status: 400 });
  }
}
