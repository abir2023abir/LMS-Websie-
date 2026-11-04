import { NextResponse } from 'next/server';
import { profileById } from '@/lib/accounts';
import { getPhoto, setPhoto, validPhoto } from '@/lib/teacher-photos';
import { staffDenied, staffIdentity } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

// A teacher's picture is public (it shows on the course page), so anyone can read it.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  const photo = id ? await getPhoto(id) : null;
  const match = photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return new NextResponse(null, { status: 404 });
  return new NextResponse(Buffer.from(match[2], 'base64'), {
    headers: { 'Content-Type': match[1], 'Cache-Control': 'public, max-age=300' },
  });
}

/** Admins set any instructor's picture; an instructor can only set their own. */
async function target(request: Request, body: { profileId?: string }) {
  const staff = await staffIdentity();
  if (!staff) return { error: staffDenied() };
  const id = staff.admin ? String(body.profileId || '') : staff.profile.id;
  const profile = id ? await profileById(id) : null;
  if (!profile || !profile.roles.includes('Instructor')) {
    return { error: NextResponse.json({ success: false, message: 'Choose an instructor account.' }, { status: 400 }) };
  }
  return { id };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const found = await target(request, body);
    if (found.error) return found.error;
    if (!validPhoto(body.photo)) {
      return NextResponse.json({ success: false, message: 'Use a JPG, PNG or WebP picture under 250 KB.' }, { status: 400 });
    }
    await setPhoto(found.id!, body.photo);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Could not save the picture.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const found = await target(request, body);
    if (found.error) return found.error;
    await setPhoto(found.id!, null);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Could not remove the picture.' }, { status: 500 });
  }
}
