import { NextResponse } from 'next/server';
import { confirmSslPayment, siteUrl } from '@/lib/sslcommerz';

export const dynamic = 'force-dynamic';

// SSLCommerz posts the buyer back here. The payment is only marked paid after the
// server re-checks it with SSLCommerz's validation API.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  try {
    const form = await request.formData();
    const payment = await confirmSslPayment(String(form.get('val_id') || ''), String(form.get('tran_id') || ''));
    if (payment?.status === 'paid') return NextResponse.redirect(`${base}/student?payment=success`, 303);
  } catch (error) {
    console.error('[payment/success]', error);
  }
  return NextResponse.redirect(`${base}/checkout/${encodeURIComponent(courseId)}?status=failed`, 303);
}

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  return NextResponse.redirect(`${siteUrl(request)}/checkout/${encodeURIComponent(courseId)}`, 303);
}
