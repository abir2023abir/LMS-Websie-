import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || 'eng-1';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return NextResponse.redirect(`${baseUrl}/checkout/${courseId}?status=failed`, 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId') || 'eng-1';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return NextResponse.redirect(`${baseUrl}/checkout/${courseId}?status=failed`, 303);
}
