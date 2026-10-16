import fs from 'fs';
import path from 'path';

export interface PaymentConfig {
  storeId: string;
  storePassword: string;
  live: boolean;
}

const file = path.join(process.cwd(), 'data', 'payment-settings.json');

export function readPaymentConfig(): PaymentConfig {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<PaymentConfig>;
    return {
      storeId: parsed.storeId || process.env.SSLCOMMERZ_STORE_ID || '',
      storePassword: parsed.storePassword || process.env.SSLCOMMERZ_STORE_PASSWORD || '',
      live: Boolean(parsed.live),
    };
  } catch {
    return {
      storeId: process.env.SSLCOMMERZ_STORE_ID || '',
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
      live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    };
  }
}

export function writePaymentConfig(config: PaymentConfig) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}
