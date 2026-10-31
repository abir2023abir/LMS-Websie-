declare module 'sslcommerz-lts' {
  export default class SslCommerzPayment {
    constructor(storeId: string, storePassword: string, live?: boolean);
    init(data: Record<string, unknown>): Promise<Record<string, any>>;
    validate(data: { val_id: string }): Promise<Record<string, any>>;
  }
}
