import type { MoyasarPaymentRequest, MoyasarPaymentResponse } from './types';

const MOYASAR_API = 'https://api.moyasar.com/v1';

function getSecretKey(): string {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) throw new Error('Missing MOYASAR_SECRET_KEY');
  return key;
}

function basicAuth(key: string): string {
  return 'Basic ' + Buffer.from(key + ':').toString('base64');
}

// SAR → Halala (Moyasar requires smallest currency unit)
export function sarToHalala(sar: number): number {
  return Math.round(sar * 100);
}

export async function createPayment(
  amountSAR: number,
  description: string,
  callbackUrl: string,
  metadata?: Record<string, string>
): Promise<MoyasarPaymentResponse> {
  const body: MoyasarPaymentRequest = {
    amount: sarToHalala(amountSAR),
    currency: 'SAR',
    description,
    callback_url: callbackUrl,
    source: { type: 'creditcard' }, // overridden client-side via Moyasar.js
    metadata,
  };

  const res = await fetch(`${MOYASAR_API}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(getSecretKey()),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Moyasar error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<MoyasarPaymentResponse>;
}

export async function getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
  const res = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
    headers: { Authorization: basicAuth(getSecretKey()) },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Moyasar getPayment ${res.status}`);
  return res.json() as Promise<MoyasarPaymentResponse>;
}
