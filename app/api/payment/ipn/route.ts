import { NextResponse } from 'next/server';
import { confirmSslPayment } from '@/lib/sslcommerz';

export const dynamic = 'force-dynamic';

// SSLCommerz's server-to-server notification: confirms payments even if the buyer closes the tab.
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const payment = await confirmSslPayment(String(form.get('val_id') || ''), String(form.get('tran_id') || ''));
    return NextResponse.json({ success: Boolean(payment), status: payment?.status || 'unknown' });
  } catch (error) {
    console.error('[payment/ipn]', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
