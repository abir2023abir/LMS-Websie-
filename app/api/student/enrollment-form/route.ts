import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/user-session';
import { listProfiles, requestGuardianLink } from '@/lib/accounts';
import { coursePrice } from '@/lib/course-pricing';
import { cleanDetails, listEnrollmentForms, saveEnrollmentForm } from '@/lib/enrollment-forms';
import { rateLimited, TOO_MANY } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// The student's own saved form (this course, else their latest one) to fill the boxes again.
export async function GET(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  const mine = (await listEnrollmentForms()).filter((item) => item.studentId === profile.id);
  const saved = mine.find((item) => item.courseId === courseId) || mine[0] || null;
  return NextResponse.json({
    success: true,
    account: { name: profile.name || '', email: profile.email, phone: profile.phone || '' },
    saved: saved ? { ...saved, studentId: undefined, accountEmail: undefined, consent: false, ...(saved.courseId === courseId ? {} : { paymentMethod: '', paymentReference: '' }) } : null,
  });
}

export async function POST(request: Request) {
  const { profile, denied } = await requireRole('Student');
  if (denied) return denied;
  if (rateLimited(request, 'enrollment-form', 20, 10 * 60 * 1000)) return NextResponse.json(TOO_MANY, { status: 429 });
  try {
    const body = await request.json();
    const courseId = String(body.courseId || '').trim();
    const price = courseId ? await coursePrice(courseId) : null;
    if (!price) return NextResponse.json({ success: false, message: 'This course is not available for enrollment.' }, { status: 404 });
    const details = cleanDetails(body.details || {}, price.amount > 0);
    await saveEnrollmentForm({ ...details, studentId: profile.id, accountEmail: profile.email, courseId, courseTitle: price.title, submittedAt: new Date().toISOString() });

    // A guardian who already has an account gets a link request; the student approves it in their dashboard.
    let guardianRequested = false;
    if (details.guardianAccess && details.guardianEmail && details.guardianEmail !== profile.email) {
      try {
        const guardian = (await listProfiles()).find((item) => item.email.toLowerCase() === details.guardianEmail && item.roles.includes('Guardian'));
        if (guardian) {
          const link = await requestGuardianLink(guardian.id, profile.email);
          guardianRequested = link.status === 'pending';
        }
      } catch (error) {
        console.error('[enrollment-form] guardian link failed:', error);
      }
    }
    return NextResponse.json({ success: true, guardianRequested });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the form.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
