import { NextResponse } from 'next/server';
import { findCertificate, generateUniqueCertificateId, saveCertificateRecord, type CertificateRecord } from '@/lib/certificate-db';
import { getCourseById } from '@/lib/db';
import { getEnrollments } from '@/lib/payments';
import { courseProgress } from '@/lib/progression';
import { requireRole } from '@/lib/user-session';

export const dynamic = 'force-dynamic';

/**
 * Issues the signed-in student's certificate for a course.
 * Everything on the certificate comes from the server: the student must be enrolled
 * and must have finished every step of every lesson, otherwise nothing is issued.
 */
export async function POST(request: Request) {
  try {
    const { profile, denied } = await requireRole('Student');
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    const courseId = String(body?.courseId || '').trim();
    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Course is required.' }, { status: 400 });
    }

    if (!(await getEnrollments(profile.id)).includes(courseId)) {
      return NextResponse.json({ success: false, message: 'Enroll in this course first.' }, { status: 403 });
    }

    const progress = await courseProgress(profile.id, courseId);
    if (!progress.lessons.length || progress.percent < 100) {
      return NextResponse.json(
        { success: false, message: 'Finish every lesson step (video, quiz, assignment, exam and live class or approval) to unlock your certificate.' },
        { status: 403 }
      );
    }

    const existing = await findCertificate(profile.email, courseId);
    if (existing && existing.status === 'VALID') {
      return NextResponse.json({ success: true, certificateId: existing.certificateId, verificationUrl: existing.verificationUrl, certificate: existing });
    }

    const course = await getCourseById(courseId).catch(() => null);
    const certificateId = generateUniqueCertificateId();
    const host = request.headers.get('host') || 'localhost:3005';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/verify-certificate?id=${certificateId}`;

    const record: CertificateRecord = {
      certificateId,
      studentName: profile.name.trim(),
      studentEmail: profile.email,
      courseTitle: progress.courseTitle || course?.title || 'Career Bridge.Studio Course',
      courseId,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      grade: 'Pass with Distinction (100% Complete)',
      instructorName: course?.instructorName || 'Career Bridge.Studio Academic Team',
      verificationUrl,
      createdAt: new Date().toISOString(),
      status: 'VALID',
      verified: true,
    };

    const saved = await saveCertificateRecord(record);
    return NextResponse.json({ success: true, certificateId: saved.certificateId, verificationUrl, certificate: saved });
  } catch (error: any) {
    console.error('[API Certificate Generate Error]:', error);
    return NextResponse.json({ success: false, message: error.message || 'Certificate generation failed' }, { status: 500 });
  }
}
