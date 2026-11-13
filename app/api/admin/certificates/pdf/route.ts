import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getCertificate } from '@/lib/admin-studio';
import { buildCertificatePdf } from '@/lib/certificate-pdf';

export async function GET(request: Request) {
  const denied = await requireAdmin('Certificate');
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get('id') || '';
  const certificate = getCertificate(id);
  if (!certificate) return NextResponse.json({ success: false, message: 'Certificate not found.' }, { status: 404 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
  const pdf = await buildCertificatePdf({
    ...certificate,
    verifyUrl: `${origin}/verify-certificate?id=${encodeURIComponent(certificate.id)}`,
  });
  const bytes = new Uint8Array(pdf);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${certificate.id}.pdf"`,
    },
  });
}
