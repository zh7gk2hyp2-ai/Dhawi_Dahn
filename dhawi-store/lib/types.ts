// ─────────────────────────────────────────────
// Core domain types for Atelier Dhawi store
// ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;          // Arabic name
  name_en: string;       // English / transliterated name
  icon: string;          // Emoji or icon identifier
  description: string;   // Arabic product description
  season: string;        // Arabic season label e.g. "شتاء", "صيف"
  gender: string;        // "رجالي" | "نسائي" | "للجنسين"
  stability: string;     // Arabic longevity label e.g. "طويل الأمد"
  price: number;         // SAR
  stock_available: boolean;

  // Fragrance pyramid — percentages must sum to 100
  layer_top: number;     // Top notes %
  layer_heart: number;   // Heart notes %
  layer_base: number;    // Base notes %

  // Optional extended fields
  notes_top?: string[];    // e.g. ["بيرغموت", "زعفران"]
  notes_heart?: string[];  // e.g. ["ورد", "عود"]
  notes_base?: string[];   // e.g. ["مسك", "أمبرجري"]
  volume_ml?: number;
  concentration?: 'EDP' | 'EDP Intense' | 'Parfum' | 'Extrait';
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;    // Saudi phone format: +966XXXXXXXXX
  customer_address: string;
  customer_city?: string;
  customer_postal_code?: string;
  items: CartItem[];
  subtotal: number;          // SAR, before VAT
  vat: number;               // SAR, 15%
  total: number;             // SAR, subtotal + vat
  status: OrderStatus;
  payment_id?: string;       // Moyasar payment ID
  payment_method?: 'creditcard' | 'mada' | 'applepay' | 'stcpay';
  tracking_number?: string;  // Aramex tracking number
  created_at: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// ─── Payment ───────────────────────────────
export interface MoyasarPaymentRequest {
  amount: number;           // Halala (SAR × 100)
  currency: 'SAR';
  description: string;
  callback_url: string;
  source: MoyasarSource;
  metadata?: Record<string, string>;
}

export interface MoyasarSource {
  type: 'creditcard' | 'mada' | 'applepay' | 'stcpay';
  name?: string;
  number?: string;
  month?: string;
  year?: string;
  cvc?: string;
  token?: string;
}

export interface MoyasarPaymentResponse {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded' | 'voided';
  amount: number;
  currency: string;
  description: string;
  amount_format: string;
  fee: number;
  fee_format: string;
  created_at: string;
  updated_at: string;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    message?: string;
    transaction_url?: string;
  };
}

// ─── Shipping ──────────────────────────────
export interface AramexShipmentRequest {
  shipper: AramexParty;
  consignee: AramexParty;
  details: AramexShipmentDetails;
}

export interface AramexParty {
  name: string;
  phone: string;
  city: string;
  country_code: string; // e.g. "SA"
  address_line1: string;
  postal_code?: string;
}

export interface AramexShipmentDetails {
  weight: number;       // kg
  dimensions?: { length: number; width: number; height: number }; // cm
  description: string;
  declared_value?: number;
  declared_currency?: string;
}

// ─── Supabase DB row shapes ─────────────────
export interface ProductRow extends Omit<Product, 'notes_top' | 'notes_heart' | 'notes_base'> {
  notes_top: string | null;    // stored as comma-separated
  notes_heart: string | null;
  notes_base: string | null;
}

export interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string | null;
  customer_postal_code: string | null;
  subtotal: number;
  vat: number;
  total: number;
  status: OrderStatus;
  payment_id: string | null;
  payment_method: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}
