import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import {
  deleteLocalOrientationProgramme,
  localOrientationProgrammes,
  saveLocalOrientationProgramme,
  updateLocalOrientationProgramme,
} from '@/lib/orientation-programme-store';

const hasCmsDatabase = () => Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function allProgrammes() {
  if (!hasCmsDatabase()) return localOrientationProgrammes();
  const { getAllOrientationProgrammes } = await import('@/lib/landing-cms');
  return getAllOrientationProgrammes();
}

export async function GET() {
  const denied = await requireAdmin('Landing Page CMS');
  if (denied) return denied;
  if (process.env.VERCEL && !hasCmsDatabase()) {
    return NextResponse.json({ success: false, message: 'Configure Supabase to manage published programmes.' }, { status: 503 });
  }
  return NextResponse.json({ success: true, programmes: await allProgrammes() });
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Landing Page CMS');
  if (denied) return denied;
  if (process.env.VERCEL && !hasCmsDatabase()) {
    return NextResponse.json({ success: false, message: 'Configure Supabase to manage published programmes.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || '');

    if (body.action === 'delete') {
      if (!id) throw new Error('Choose a programme to delete.');
      if (hasCmsDatabase()) {
        const { deleteOrientationProgramme } = await import('@/lib/landing-cms');
        await deleteOrientationProgramme(id);
      } else deleteLocalOrientationProgramme(id);
      return NextResponse.json({ success: true, programmes: await allProgrammes() });
    }

    if (body.action === 'toggle') {
      if (!id) throw new Error('Choose a programme to update.');
      if (hasCmsDatabase()) {
        const { updateOrientationProgramme } = await import('@/lib/landing-cms');
        await updateOrientationProgramme(id, { is_active: Boolean(body.is_active) });
      } else updateLocalOrientationProgramme(id, { is_active: Boolean(body.is_active) });
      return NextResponse.json({ success: true, programmes: await allProgrammes() });
    }

    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const eventDate = String(body.event_date || '').trim();
    if (!title || !description || !eventDate || !Number.isFinite(new Date(eventDate).getTime())) {
      throw new Error('Add a title, description, and valid event date.');
    }
    const registrationUrl = String(body.registration_url || '').trim();
    if (registrationUrl && !(/^https?:\/\//i.test(registrationUrl) || /^\/(?!\/)/.test(registrationUrl))) {
      throw new Error('Registration URL must be an https:// link or an internal path such as /signup.');
    }

    const programme = {
      title,
      description,
      event_date: eventDate,
      event_time: String(body.event_time || '').trim() || undefined,
      duration: String(body.duration || '').trim() || undefined,
      format: String(body.format || '').trim() || undefined,
      status: String(body.status || 'Scheduled').trim(),
      registration_url: registrationUrl || undefined,
      is_active: Boolean(body.is_active),
    };

    if (hasCmsDatabase()) {
      const cms = await import('@/lib/landing-cms');
      if (id) await cms.updateOrientationProgramme(id, programme);
      else await cms.createOrientationProgramme(programme);
    } else {
      const localProgramme = { ...programme, event_date: programme.event_date || null };
      if (id) updateLocalOrientationProgramme(id, { ...localProgramme, id });
      else saveLocalOrientationProgramme(localProgramme);
    }

    return NextResponse.json({ success: true, programmes: await allProgrammes() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the programme.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
