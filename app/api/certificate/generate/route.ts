import { NextResponse } from 'next/server';
import { generateUniqueCertificateId, saveCertificateRecord, type CertificateRecord } from '@/lib/certificate-db';
import { getCourseById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentName,
      courseTitle,
      courseId,
      completionDate,
      grade,
      instructorName,
      studentEmail,
    } = body;

    if (!studentName) {
      return NextResponse.json(
        { success: false, message: 'Student name is required for certificate generation' },
        { status: 400 }
      );
    }

    // Resolve course title if needed
    let resolvedTitle = courseTitle;
    if (!resolvedTitle && courseId) {
      const course = await getCourseById(courseId);
      resolvedTitle = course?.title || 'English Capsule Program';
    }
    if (!resolvedTitle) {
      resolvedTitle = 'General English Foundation Capsule';
    }

    const certificateId = body.certificateId || generateUniqueCertificateId();

    const host = request.headers.get('host') || 'localhost:3002';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/verify-certificate?id=${certificateId}`;

    const formattedDate =
      completionDate ||
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    const certRecord: CertificateRecord = {
      certificateId,
      studentName: studentName.trim(),
      studentEmail: studentEmail || '',
      courseTitle: resolvedTitle,
      courseId: courseId || '1',
      issueDate: formattedDate,
      grade: grade || 'Pass with Distinction (100% Complete)',
      instructorName: instructorName || 'English Capsules Global Academic Council',
      verificationUrl,
      createdAt: new Date().toISOString(),
      status: 'VALID',
      verified: true,
    };

    // Save record to database
    const savedRecord = await saveCertificateRecord(certRecord);

    return NextResponse.json({
      success: true,
      message: 'Certificate successfully generated and registered in database',
      certificateId,
      verificationUrl,
      certificate: savedRecord,
    });
  } catch (error: any) {
    console.error('[API Certificate Generate Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Certificate generation failed' },
      { status: 500 }
    );
  }
}
