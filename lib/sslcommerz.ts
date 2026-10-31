import SslCommerzPayment from 'sslcommerz-lts';
import { findPayment, getPaymentSettings, savePayment, type PaymentRecord } from '@/lib/payments';

export function siteUrl(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

async function client() {
  const { ssl } = await getPaymentSettings();
  if (!ssl.enabled || !ssl.storeId || !ssl.storePassword) throw new Error('SSLCommerz is not switched on.');
  return new SslCommerzPayment(ssl.storeId, ssl.storePassword, ssl.live);
}

/** Opens an SSLCommerz checkout session for a pending payment and returns the gateway URL. */
export async function startSslSession(payment: PaymentRecord, phone: string, base: string): Promise<string> {
  const sslcz = await client();
  const course = encodeURIComponent(payment.courseId);
  const response = await sslcz.init({
    total_amount: payment.amount,
    currency: 'BDT',
    tran_id: payment.transactionId,
    success_url: `${base}/api/payment/success?courseId=${course}`,
    fail_url: `${base}/api/payment/fail?courseId=${course}`,
    cancel_url: `${base}/api/payment/cancel?courseId=${course}`,
    ipn_url: `${base}/api/payment/ipn`,
    shipping_method: 'NO',
    product_name: payment.courseTitle.slice(0, 250),
    product_category: 'Education',
    product_profile: 'non-physical-goods',
    cus_name: payment.studentName,
    cus_email: payment.studentEmail,
    cus_add1: 'Bangladesh',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: phone || '01700000000',
    value_a: payment.id,
  });
  if (!response?.GatewayPageURL) throw new Error(response?.failedreason || 'SSLCommerz did not return a payment page.');
  return String(response.GatewayPageURL);
}

/**
 * Confirms a payment with SSLCommerz's validation API (never trusting the browser),
 * then marks it paid, which enrolls the student. Returns the updated record.
 */
export async function confirmSslPayment(valId: string, tranId: string): Promise<PaymentRecord | null> {
  const payment = await findPayment((item) => item.source === 'sslcommerz' && item.transactionId === tranId);
  if (!payment) return null;
  if (payment.status === 'paid') return payment;
  if (!valId) return savePayment({ ...payment, status: 'failed' });

  const sslcz = await client();
  const result = await sslcz.validate({ val_id: valId });
  const valid = ['VALID', 'VALIDATED'].includes(String(result?.status))
    && String(result?.tran_id) === tranId
    && String(result?.currency_type || result?.currency || 'BDT') === 'BDT'
    && Number(result?.currency_amount ?? result?.amount) >= payment.amount;

  return savePayment({ ...payment, status: valid ? 'paid' : 'failed', method: valid && result?.card_type ? `SSLCommerz (${result.card_type})` : payment.method });
}

export async function markSslFailed(tranId: string) {
  const payment = await findPayment((item) => item.source === 'sslcommerz' && item.transactionId === tranId);
  if (payment && payment.status === 'pending') await savePayment({ ...payment, status: 'failed' });
}

/** Shared handler for SSLCommerz's fail and cancel return URLs. */
export async function paymentReturn(request: Request, status: 'failed' | 'cancelled') {
  const courseId = new URL(request.url).searchParams.get('courseId') || '';
  if (request.method === 'POST') {
    try {
      const form = await request.formData();
      await markSslFailed(String(form.get('tran_id') || ''));
    } catch (error) {
      console.error(`[payment/${status}]`, error);
    }
  }
  return Response.redirect(`${siteUrl(request)}/checkout/${encodeURIComponent(courseId)}?status=${status}`, 303);
}
