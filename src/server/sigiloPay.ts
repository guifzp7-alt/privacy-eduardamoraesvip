export interface SigiloPayCheckoutOptions {
  externalId: string;
  productName: string;
  amount: number;
  thankYouPage?: string;
}

export interface SigiloPayCheckoutResponse {
  checkoutUrl: string;
  productId?: string;
  offerCode?: string;
}

export class SigiloPayClient {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(publicKey: string, secretKey: string, baseUrl = 'https://app.sigilopay.com.br') {
    this.publicKey = publicKey.trim();
    this.secretKey = secretKey.trim();
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  get isConfigured() {
    return this.publicKey.length > 5 && this.secretKey.length > 5;
  }

  updateCredentials(publicKey: string, secretKey: string) {
    this.publicKey = (publicKey || '').trim();
    this.secretKey = (secretKey || '').trim();
  }

  async createCheckout(options: SigiloPayCheckoutOptions): Promise<SigiloPayCheckoutResponse> {
    if (!this.isConfigured) {
      throw new Error('Configure SIGILOPAY_PUBLIC_KEY e SIGILOPAY_SECRET_KEY antes de criar um checkout.');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/gateway/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': this.publicKey,
        'x-secret-key': this.secretKey,
      },
      body: JSON.stringify({
        product: {
          externalId: options.externalId,
          name: options.productName,
          offer: {
            name: options.productName,
            // A SigilioPay recebe o valor em reais, por exemplo 14.95.
            price: Number(options.amount.toFixed(2)),
            offerType: 'NATIONAL',
            currency: 'BRL',
            lang: 'pt-BR',
          },
        },
        settings: {
          paymentMethods: ['PIX'],
          acceptedDocs: ['CPF'],
          askForAddress: false,
          ...(options.thankYouPage ? { thankYouPage: options.thankYouPage } : {}),
        },
        trackProps: { external_id: options.externalId },
      }),
    });

    const data = await response.json().catch(() => null) as Partial<SigiloPayCheckoutResponse> & { message?: string } | null;
    if (!response.ok || !data?.checkoutUrl) {
      throw new Error(data?.message || `A SigilioPay não criou o checkout (HTTP ${response.status}).`);
    }

    return {
      checkoutUrl: data.checkoutUrl,
      productId: data.productId,
      offerCode: data.offerCode,
    };
  }

  /** @deprecated A rota oficial deste projeto agora usa createCheckout(). */
  async createPix(_options: unknown): Promise<any> {
    throw new Error('A criação direta de PIX foi desativada. Use o checkout hospedado da SigilioPay.');
  }
}
