import { paymentReturn } from '@/lib/sslcommerz';

export const dynamic = 'force-dynamic';

export const POST = (request: Request) => paymentReturn(request, 'cancelled');
export const GET = (request: Request) => paymentReturn(request, 'cancelled');
