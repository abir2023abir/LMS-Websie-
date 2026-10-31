import { paymentReturn } from '@/lib/sslcommerz';

export const dynamic = 'force-dynamic';

export const POST = (request: Request) => paymentReturn(request, 'failed');
export const GET = (request: Request) => paymentReturn(request, 'failed');
