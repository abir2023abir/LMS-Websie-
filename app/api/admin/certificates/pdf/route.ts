import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getCertificate } from '@/lib/admin-studio';
import { buildCertificatePdf } from '@/lib/certificate-pdf';

export async function GET(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get('id') || '';
  const certificate = getCertificate(id);
  if (!certificate) return NextResponse.json({ success: false, message: 'Certificate not found.' }, { status: 404 });
  const pdf = await buildCertificatePdf(certificate);
  const bytes = new Uint8Array(pdf);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${certificate.id}.pdf"`,
    },
  });
}
