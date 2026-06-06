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

// ─── Saudi VAT helpers ────────────────────────────────────────────────────────
export const VAT_RATE = 0.15; // Saudi Arabia — 15%

/** Round to 2 decimal places. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate subtotal, VAT (15%), and grand total from a pre-tax subtotal.
 */
export function calculateTotal(subtotalSAR: number): {
  subtotal: number;
  vat: number;
  total: number;
} {
  const subtotal = round2(subtotalSAR);
  const vat      = round2(subtotal * VAT_RATE);
  const total    = round2(subtotal + vat);
  return { subtotal, vat, total };
}

/**
 * Format a SAR amount for display using Arabic locale.
 * Example: formatSAR(185) → "‏١٨٥٫٠٠ ر.س."
 */
export function formatSAR(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Halala → SAR  (for displaying Moyasar webhook amounts).
 */
export function halalaToSar(halala: number): number {
  return halala / 100;
}
