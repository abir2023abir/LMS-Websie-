import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { deletePayment, listPayments, readProof, saveProof, savePayment, setPaymentStatus, type PaymentStatus } from '@/lib/payments';

export const dynamic = 'force-dynamic';

const STATUSES = new Set<PaymentStatus>(['pending', 'approved', 'rejected', 'paid', 'failed']);
const asStatus = (value: unknown) => (STATUSES.has(value as PaymentStatus) ? (value as PaymentStatus) : undefined);

export async function GET(request: Request) {
  const denied = await requireAdmin('Payments');
  if (denied) return denied;
  const proof = new URL(request.url).searchParams.get('proof') || '';
  if (proof) {
    const file = await readProof(proof);
    if (!file) return NextResponse.json({ success: false }, { status: 404 });
    return new NextResponse(new Uint8Array(file.bytes), { headers: { 'Content-Type': file.type, 'Cache-Control': 'private, max-age=300' } });
  }
  return NextResponse.json({ success: true, payments: await listPayments() });
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Payments');
  if (denied) return denied;
  try {
    const type = request.headers.get('content-type') || '';
    if (type.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('screenshot');
      const screenshot = file instanceof File && file.size > 0 ? await saveProof(file) : undefined;
      await savePayment({
        id: String(form.get('id') || '') || undefined,
        studentName: String(form.get('studentName') || ''),
        studentEmail: String(form.get('studentEmail') || ''),
        courseTitle: String(form.get('courseTitle') || ''),
        amount: Number(form.get('amount')) || 0,
        method: String(form.get('method') || ''),
        transactionId: String(form.get('transactionId') || ''),
        status: asStatus(form.get('status')),
        source: String(form.get('source') || 'manual') === 'sslcommerz' ? 'sslcommerz' : 'manual',
        ...(screenshot ? { screenshot } : {}),
      });
      return NextResponse.json({ success: true, payments: await listPayments() });
    }

    const body = await request.json();
    if (body.action === 'delete') {
      await deletePayment(String(body.id || ''));
      return NextResponse.json({ success: true, payments: await listPayments() });
    }
    if (body.action === 'status') {
      // Approving (or marking paid) opens the course for the student automatically.
      await setPaymentStatus(String(body.id || ''), asStatus(body.status) || 'pending');
      return NextResponse.json({ success: true, payments: await listPayments() });
    }
    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the payment.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
