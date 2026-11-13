import { NextResponse } from 'next/server';
import { courseSettings, profileByEmail } from '@/lib/accounts';
import { getCard, hasEducation } from '@/lib/instructor-cards';
import { staffIdentity } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

/** Public mentor card for a course. Education is omitted when the admin left it blank. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || '';
  if (courseId) {
    const settings = await courseSettings(courseId);
    const profile = settings.mentor_email ? await profileByEmail(settings.mentor_email) : null;
    if (!profile || profile.disabled || !profile.roles.includes('Instructor')) {
      return NextResponse.json({ success: true, mentor: null });
    }
    const card = await getCard(profile.id);
    return NextResponse.json({
      success: true,
      mentor: {
        id: profile.id,
        name: profile.name,
        bio: card.bio,
        university: hasEducation(card) ? card.university : '',
        degree: hasEducation(card) ? card.degree : '',
      },
    });
  }

  const staff = await staffIdentity();
  if (!staff || staff.admin) return NextResponse.json({ success: true, card: null });
  const card = await getCard(staff.profile.id);
  return NextResponse.json({ success: true, card, name: staff.profile.name, id: staff.profile.id });
}
