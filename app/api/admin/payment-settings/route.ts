import { NextResponse } from 'next/server';
import { requireAdmin, requireAdminWrite } from '@/lib/admin-guard';
import { getPaymentSettings, savePaymentSettings, type ManualMethodId, type PaymentSettings } from '@/lib/payments';

export const dynamic = 'force-dynamic';

const MANUAL_IDS: ManualMethodId[] = ['bkash', 'nagad', 'rocket'];
const ACCOUNT_TYPES = new Set(['Personal', 'Agent', 'Merchant']);

export async function GET() {
  const denied = await requireAdmin('Payments');
  if (denied) return denied;
  const settings = await getPaymentSettings();
  // Never send the SSLCommerz password back to the browser.
  return NextResponse.json({
    success: true,
    settings: { ...settings, ssl: { ...settings.ssl, storePassword: '' } },
    hasStorePassword: Boolean(settings.ssl.storePassword),
  });
}

export async function POST(request: Request) {
  const denied = await requireAdminWrite('Payments');
  if (denied) return denied;
  try {
    const body = (await request.json()) as Partial<PaymentSettings>;
    const current = await getPaymentSettings();
    const next: PaymentSettings = {
      ssl: {
        enabled: Boolean(body.ssl?.enabled),
        storeId: String(body.ssl?.storeId ?? current.ssl.storeId).trim(),
        // A blank password keeps the saved one.
        storePassword: String(body.ssl?.storePassword || '').trim() || current.ssl.storePassword,
        live: Boolean(body.ssl?.live),
      },
      manual: Object.fromEntries(MANUAL_IDS.map((id) => {
        const item = body.manual?.[id];
        const number = String(item?.number ?? current.manual[id].number).replace(/[^\d+]/g, '').slice(0, 15);
        const accountType = item && ACCOUNT_TYPES.has(String(item.accountType)) ? item.accountType : current.manual[id].accountType;
        return [id, { enabled: Boolean(item?.enabled) && Boolean(number), number, accountType }];
      })) as PaymentSettings['manual'],
      manualInstructions: String(body.manualInstructions ?? current.manualInstructions).slice(0, 600),
    };
    if (next.ssl.enabled && (!next.ssl.storeId || !next.ssl.storePassword)) {
      return NextResponse.json({ success: false, message: 'Enter the SSLCommerz Store ID and Store Password before turning it on.' }, { status: 400 });
    }
    await savePaymentSettings(next);
    return NextResponse.json({ success: true, settings: { ...next, ssl: { ...next.ssl, storePassword: '' } }, hasStorePassword: Boolean(next.ssl.storePassword) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save payment settings.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
