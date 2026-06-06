import { createClient } from '@supabase/supabase-js';
import type { ProductRow, OrderRow, OrderItemRow } from './types';

// ─────────────────────────────────────────────
// Database schema type map for Supabase client
// ─────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProductRow, 'id' | 'created_at'>>;
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<OrderRow, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Omit<OrderItemRow, 'id'>;
        Update: Partial<Omit<OrderItemRow, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    };
  };
}

// ─────────────────────────────────────────────
// Environment variable validation
// ─────────────────────────────────────────────
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL. ' +
      'Copy .env.example to .env.local and fill in your Supabase project URL.'
    );
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local and fill in your Supabase anon key.'
    );
  }
  return key;
}

// ─────────────────────────────────────────────
// Browser client (singleton pattern)
// ─────────────────────────────────────────────
// Use this in Client Components ('use client').
// The singleton prevents multiple GoTrueClient instances
// from being created when the component re-renders.

let _browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createBrowserClient() {
  if (_browserClient) return _browserClient;

  _browserClient = createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-application-name': 'dhawi-store',
        },
      },
    }
  );

  return _browserClient;
}

// ─────────────────────────────────────────────
// Server client (no cookie handling needed for
// public storefront; admin routes use service key)
// ─────────────────────────────────────────────
// Use this in Server Components, Route Handlers, and Server Actions.
// Creates a fresh client per request (no singleton — safe in Node.js edge/serverless).

export function createServerClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-application-name': 'dhawi-store-server',
        },
      },
    }
  );
}

// ─────────────────────────────────────────────
// Admin/service-role client
// WARNING: Never expose this to the browser.
// Only use in Server Actions or API Route Handlers.
// ─────────────────────────────────────────────
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. ' +
      'This client must only be used in server-side code.'
    );
  }

  return createClient<Database>(
    getSupabaseUrl(),
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// ─────────────────────────────────────────────
// Default export — browser client for convenience
// ─────────────────────────────────────────────
// Usage: import supabase from '@/lib/supabase'
// Or:    import { createBrowserClient } from '@/lib/supabase'
let _defaultClient: ReturnType<typeof createClient<Database>> | null = null;

const supabase = (() => {
  // Lazily initialise so the module can be imported without env vars
  // being required at module evaluation time (e.g. in tests).
  return new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(_, prop) {
      if (!_defaultClient) {
        _defaultClient = createBrowserClient();
      }
      return (_defaultClient as unknown as Record<string | symbol, unknown>)[prop];
    },
  });
})();

export default supabase;
