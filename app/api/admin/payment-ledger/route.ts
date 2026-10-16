import { NextResponse } from 'next/server';
import fs from 'fs';
import { requireAdmin } from '@/lib/admin-guard';
import { deletePayment, listPayments, proofFilePath, savePayment, setPaymentStatus, type PaymentStatus } from '@/lib/admin-studio';

export async function GET(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  const proof = new URL(request.url).searchParams.get('proof') || '';
  if (proof) {
    const target = proofFilePath(proof);
    if (!fs.existsSync(target)) return NextResponse.json({ success: false }, { status: 404 });
    const bytes = fs.readFileSync(target);
    const ext = proof.toLowerCase();
    const type = ext.endsWith('.png') ? 'image/png' : ext.endsWith('.webp') ? 'image/webp' : ext.endsWith('.gif') ? 'image/gif' : 'image/jpeg';
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': type } });
  }
  return NextResponse.json({ success: true, payments: listPayments() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const type = request.headers.get('content-type') || '';
    if (type.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('screenshot');
      const bytes = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : undefined;
      savePayment({
        id: String(form.get('id') || '') || undefined,
        studentName: String(form.get('studentName') || ''),
        studentEmail: String(form.get('studentEmail') || ''),
        courseTitle: String(form.get('courseTitle') || ''),
        amount: Number(form.get('amount')) || 0,
        method: String(form.get('method') || ''),
        transactionId: String(form.get('transactionId') || ''),
        status: (String(form.get('status') || '') || undefined) as PaymentStatus | undefined,
        source: String(form.get('source') || 'manual') === 'sslcommerz' ? 'sslcommerz' : 'manual',
        fileName: file instanceof File ? file.name : '',
        bytes,
      });
      return NextResponse.json({ success: true, payments: listPayments() });
    }

    const body = await request.json();
    if (body.action === 'delete') {
      deletePayment(String(body.id || ''));
      return NextResponse.json({ success: true, payments: listPayments() });
    }
    if (body.action === 'status') {
      setPaymentStatus(String(body.id || ''), String(body.status || 'pending') as PaymentStatus);
      return NextResponse.json({ success: true, payments: listPayments() });
    }
    savePayment({
      id: body.id ? String(body.id) : undefined,
      studentName: String(body.studentName || ''),
      studentEmail: String(body.studentEmail || ''),
      courseTitle: String(body.courseTitle || ''),
      amount: Number(body.amount) || 0,
      method: String(body.method || ''),
      transactionId: String(body.transactionId || ''),
      status: body.status ? (String(body.status) as PaymentStatus) : undefined,
      source: body.source === 'sslcommerz' ? 'sslcommerz' : 'manual',
    });
    return NextResponse.json({ success: true, payments: listPayments() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the payment.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
