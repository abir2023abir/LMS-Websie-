import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { deleteCertificate, getCertificate, listCertificates, saveCertificate } from '@/lib/admin-studio';
import { revokeCertificateRecord, saveCertificateRecord } from '@/lib/certificate-db';

export async function GET() {
  const denied = await requireAdmin('Certificate');
  if (denied) return denied;
  return NextResponse.json({ success: true, certificates: listCertificates() });
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Certificate');
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      const id = String(body.id || '');
      deleteCertificate(id);
      await revokeCertificateRecord(id);
      return NextResponse.json({ success: true, certificates: listCertificates() });
    }
    const certificate = saveCertificate({
      id: body.id ? String(body.id) : undefined,
      studentName: String(body.studentName || ''),
      course: String(body.course || ''),
      date: String(body.date || ''),
      hours: String(body.hours || ''),
      instructorName: String(body.instructorName || ''),
      courseId: String(body.courseId || ''),
    });
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
    const saved = getCertificate(certificate.id) || certificate;
    await saveCertificateRecord({
      certificateId: saved.id,
      studentName: saved.studentName,
      courseTitle: saved.course,
      courseId: saved.courseId || '',
      issueDate: saved.date,
      grade: 'Completed',
      instructorName: saved.instructorName || 'Career Bridge.Studio',
      verificationUrl: `${origin}/verify-certificate?id=${encodeURIComponent(saved.id)}`,
      createdAt: saved.createdAt,
      status: 'VALID',
      verified: true,
    });
    return NextResponse.json({ success: true, certificate: saved, certificates: listCertificates() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the certificate.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
