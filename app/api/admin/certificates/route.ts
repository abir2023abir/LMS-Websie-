import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteCertificate, listCertificates, saveCertificate } from '@/lib/admin-studio';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, certificates: listCertificates() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      deleteCertificate(String(body.id || ''));
      return NextResponse.json({ success: true, certificates: listCertificates() });
    }
    const certificate = saveCertificate({
      id: body.id ? String(body.id) : undefined,
      studentName: String(body.studentName || ''),
      course: String(body.course || ''),
      date: String(body.date || ''),
    });
    return NextResponse.json({ success: true, certificate, certificates: listCertificates() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the certificate.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
