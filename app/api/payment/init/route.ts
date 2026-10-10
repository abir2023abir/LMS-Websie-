import { NextResponse } from 'next/server';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || 'your_sslcommerz_store_id';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || 'your_sslcommerz_store_password';
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true';
export async function POST(request: Request) {
  try {
    const host = request.headers.get('host') || 'localhost:3002';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    const body = await request.json();
    const { courseId, courseTitle, price, name, email, phone, paymentMethod } = body;

    if (!courseId || !price || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required checkout details' },
        { status: 400 }
      );
    }

    const tran_id = `TXN_SSL_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const data = {
      total_amount: price,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${BASE_URL}/api/payment/success?courseId=${courseId}&email=${encodeURIComponent(email)}`,
      fail_url: `${BASE_URL}/api/payment/fail?courseId=${courseId}`,
      cancel_url: `${BASE_URL}/api/payment/cancel?courseId=${courseId}`,
      ipn_url: `${BASE_URL}/api/payment/ipn`,
      shipping_method: 'Courier',
      product_name: courseTitle || 'English Capsule Course',
      product_category: 'Education',
      product_profile: 'general',
      cus_name: name || 'Student',
      cus_email: email,
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: phone || '01700000000',
      cus_fax: '01700000000',
      ship_name: name || 'Student',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
    };

    // If store credentials are not configured or are placeholders, return sandbox/mock gateway URL
    if (STORE_ID === 'your_sslcommerz_store_id' || !STORE_ID) {
      return NextResponse.json({
        success: true,
        gatewayUrl: `${BASE_URL}/api/payment/success?courseId=${courseId}&email=${encodeURIComponent(email)}&tranId=${tran_id}`,
        tranId: tran_id,
        isSandboxMock: true,
      });
    }

    // Initialize SSLCommerz SDK
    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return NextResponse.json({
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        tranId: tran_id,
      });
    }

    // Fallback if GatewayPageURL not present
    return NextResponse.json({
      success: true,
      gatewayUrl: `${BASE_URL}/api/payment/success?courseId=${courseId}&email=${encodeURIComponent(email)}&tranId=${tran_id}`,
      tranId: tran_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Payment initialization error' },
      { status: 500 }
    );
  }
}
