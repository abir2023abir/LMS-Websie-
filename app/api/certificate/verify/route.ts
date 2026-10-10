import { NextResponse } from 'next/server';
import { getCertificateById } from '@/lib/certificate-db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const certificateId = url.searchParams.get('id') || url.searchParams.get('certificateId') || '';

    if (!certificateId.trim()) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const certRecord = await getCertificateById(certificateId.trim());

    if (!certRecord) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: `Certificate ID "${certificateId}" was not found in the official registry.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      certificate: certRecord,
    });
  } catch (error: any) {
    console.error('[API Certificate Verify Error]:', error);
    return NextResponse.json(
      { success: false, verified: false, message: error.message || 'Verification service error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const certificateId = body.certificateId || body.id || '';

    if (!certificateId.trim()) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    const certRecord = await getCertificateById(certificateId.trim());

    if (!certRecord) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: `Certificate ID "${certificateId}" was not found in the official registry.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      certificate: certRecord,
    });
  } catch (error: any) {
    console.error('[API Certificate Verify Error]:', error);
    return NextResponse.json(
      { success: false, verified: false, message: error.message || 'Verification service error' },
      { status: 500 }
    );
  }
}
